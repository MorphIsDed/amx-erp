import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notifications/notification.service';
import {
  CreateProjectDto,
  UpdateProjectDto,
  AddProjectMemberDto,
  UpdateProjectMemberDto,
} from './dto/project.dto';
import { ProjectStatus, Role } from '@repo/db';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async create(tenantId: string, createProjectDto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        ...createProjectDto,
        tenantId,
        startDate: new Date(createProjectDto.startDate),
        endDate: new Date(createProjectDto.endDate),
      },
    });
  }

  async findAll(
    tenantId: string,
    query: {
      skip?: number;
      take?: number;
      search?: string;
      status?: ProjectStatus;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ) {
    const {
      skip,
      take,
      search,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    return this.prisma.project.findMany({
      where: {
        tenantId,
        deletedAt: null,
        status,
        OR: search
          ? [
              { name: { contains: search, mode: 'insensitive' } },
              { projectCode: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ]
          : undefined,
      },
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        _count: {
          select: {
            tasks: true,
            milestones: true,
            members: true,
          },
        },
      },
    });
  }

  async findOne(tenantId: string, id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        milestones: {
          orderBy: { dueDate: 'asc' },
        },
        tasks: {
          include: {
            assignedEmployee: true,
          },
        },
        members: {
          include: {
            employee: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async update(
    tenantId: string,
    id: string,
    updateProjectDto: UpdateProjectDto,
  ) {
    await this.findOne(tenantId, id);

    const updated = await this.prisma.project.update({
      where: { id },
      data: {
        ...updateProjectDto,
        startDate: updateProjectDto.startDate
          ? new Date(updateProjectDto.startDate)
          : undefined,
        endDate: updateProjectDto.endDate
          ? new Date(updateProjectDto.endDate)
          : undefined,
      },
    });

    // Check budget overrun
    if (updated.actualBudget > updated.plannedBudget) {
      await this.triggerBudgetOverrunNotification(tenantId, updated);
    }

    return updated;
  }

  async remove(tenantId: string, id: string) {
    // Soft delete
    return this.prisma.project.updateMany({
      where: { id, tenantId },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  // Budget Tracking Engine
  async getBudgetTracker(tenantId: string, projectId: string) {
    const project = await this.findOne(tenantId, projectId);
    const planned = project.plannedBudget;
    const actual = project.actualBudget;
    const variance = planned - actual;
    const status = actual > planned ? 'OVERRUN' : 'WITHIN_BUDGET';

    return {
      projectId,
      projectName: project.name,
      plannedBudget: planned,
      actualBudget: actual,
      variance,
      status,
      percentageUsed: planned > 0 ? (actual / planned) * 100 : 0,
    };
  }

  // Helper trigger for budget notifications
  private async triggerBudgetOverrunNotification(
    tenantId: string,
    project: any,
  ) {
    // Notify ADMIN and MANAGER roles in the tenant
    const managers = await this.prisma.user.findMany({
      where: {
        tenantId,
        role: { in: [Role.ADMIN, Role.MANAGER] },
      },
    });

    for (const manager of managers) {
      try {
        await this.notificationService.create({
          userId: manager.id,
          tenantId,
          type: 'WARNING',
          title: 'Budget Overrun Alert',
          message: `Project "${project.name}" has exceeded its planned budget. Planned: $${project.plannedBudget}, Actual: $${project.actualBudget}`,
          link: `/projects/${project.id}`,
        });
      } catch (err) {
        console.error(`Failed to send budget alert to user ${manager.id}`, err);
      }
    }
  }

  // Resource Allocation Engine
  async addMember(
    tenantId: string,
    projectId: string,
    dto: AddProjectMemberDto,
  ) {
    // Check if project exists
    await this.findOne(tenantId, projectId);

    // Check if employee exists
    const employee = await this.prisma.employee.findFirst({
      where: { id: dto.employeeId, tenantId },
    });
    if (!employee) {
      throw new NotFoundException(
        `Employee with ID ${dto.employeeId} not found`,
      );
    }

    // Validate employee availability (Allocation cannot exceed 100% across active projects)
    await this.validateEmployeeAvailability(
      tenantId,
      dto.employeeId,
      dto.allocationPercentage,
      projectId,
    );

    // Add or update member
    return this.prisma.projectMember.upsert({
      where: {
        projectId_employeeId: {
          projectId,
          employeeId: dto.employeeId,
        },
      },
      create: {
        projectId,
        employeeId: dto.employeeId,
        allocationPercentage: dto.allocationPercentage,
      },
      update: {
        allocationPercentage: dto.allocationPercentage,
      },
    });
  }

  async updateMember(
    tenantId: string,
    projectId: string,
    employeeId: string,
    dto: UpdateProjectMemberDto,
  ) {
    await this.findOne(tenantId, projectId);

    const member = await this.prisma.projectMember.findUnique({
      where: {
        projectId_employeeId: { projectId, employeeId },
      },
    });
    if (!member) {
      throw new NotFoundException(`Project member not found`);
    }

    // Validate employee availability
    await this.validateEmployeeAvailability(
      tenantId,
      employeeId,
      dto.allocationPercentage,
      projectId,
      true,
    );

    return this.prisma.projectMember.update({
      where: {
        projectId_employeeId: { projectId, employeeId },
      },
      data: {
        allocationPercentage: dto.allocationPercentage,
      },
    });
  }

  async removeMember(tenantId: string, projectId: string, employeeId: string) {
    await this.findOne(tenantId, projectId);

    return this.prisma.projectMember.delete({
      where: {
        projectId_employeeId: { projectId, employeeId },
      },
    });
  }

  async getProjectResources(tenantId: string, projectId: string) {
    await this.findOne(tenantId, projectId);

    const members = await this.prisma.projectMember.findMany({
      where: {
        projectId,
      },
      include: {
        employee: true,
      },
    });

    return members.map((m) => ({
      employeeId: m.employeeId,
      name: `${m.employee.firstName} ${m.employee.lastName}`,
      email: m.employee.email,
      allocationPercentage: m.allocationPercentage,
    }));
  }

  async getEmployeeAllocation(tenantId: string, employeeId: string) {
    // Check if employee exists
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, tenantId },
    });
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    // Find all active project memberships
    const memberships = await this.prisma.projectMember.findMany({
      where: {
        employeeId,
        project: {
          tenantId,
          deletedAt: null,
          status: { notIn: [ProjectStatus.COMPLETED, ProjectStatus.CANCELLED] },
        },
      },
      include: {
        project: true,
      },
    });

    const assignedProjects = memberships.map((m) => ({
      projectId: m.projectId,
      projectName: m.project.name,
      projectCode: m.project.projectCode,
      allocationPercentage: m.allocationPercentage,
      status: m.project.status,
    }));

    const totalAllocation = memberships.reduce(
      (sum, m) => sum + m.allocationPercentage,
      0,
    );

    return {
      employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      assignedProjects,
      totalAllocationPercentage: totalAllocation,
      utilizationPercentage: totalAllocation, // Simple equivalence or metric
      isOverAllocated: totalAllocation > 100,
    };
  }

  private async validateEmployeeAvailability(
    tenantId: string,
    employeeId: string,
    newAllocation: number,
    projectId: string,
    isUpdate = false,
  ) {
    // Find active memberships
    const memberships = await this.prisma.projectMember.findMany({
      where: {
        employeeId,
        project: {
          tenantId,
          deletedAt: null,
          status: { notIn: [ProjectStatus.COMPLETED, ProjectStatus.CANCELLED] },
        },
      },
    });

    let existingAllocation = 0;
    for (const m of memberships) {
      // If we are updating, skip the current project allocation in sum
      if (isUpdate && m.projectId === projectId) {
        continue;
      }
      // If we are adding and there's an existing record (upsert case), skip it in sum
      if (!isUpdate && m.projectId === projectId) {
        continue;
      }
      existingAllocation += m.allocationPercentage;
    }

    if (existingAllocation + newAllocation > 100) {
      throw new BadRequestException(
        `Resource allocation failure: Employee is already allocated at ${existingAllocation}%. Adding ${newAllocation}% would exceed the maximum capacity of 100%.`,
      );
    }
  }
}
