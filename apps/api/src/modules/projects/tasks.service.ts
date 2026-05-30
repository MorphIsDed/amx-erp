import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notifications/notification.service';
import { CreateTaskDto, UpdateTaskDto, CreateTaskDependencyDto } from './dto/project.dto';
import { TaskStatus, Role } from '@repo/db';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async create(tenantId: string, createTaskDto: CreateTaskDto) {
    // Verify project exists
    const project = await this.prisma.project.findFirst({
      where: { id: createTaskDto.projectId, tenantId, deletedAt: null },
    });
    if (!project) {
      throw new NotFoundException(`Project not found`);
    }

    // Verify milestone if provided
    if (createTaskDto.milestoneId) {
      const milestone = await this.prisma.milestone.findFirst({
        where: { id: createTaskDto.milestoneId, projectId: createTaskDto.projectId, tenantId },
      });
      if (!milestone) {
        throw new NotFoundException(`Milestone not found in this project`);
      }
    }

    // Verify employee if provided
    if (createTaskDto.assignedEmployeeId) {
      const employee = await this.prisma.employee.findFirst({
        where: { id: createTaskDto.assignedEmployeeId, tenantId },
      });
      if (!employee) {
        throw new NotFoundException(`Employee not found`);
      }
    }

    const task = await this.prisma.task.create({
      data: {
        ...createTaskDto,
        tenantId,
        dueDate: new Date(createTaskDto.dueDate),
      },
    });

    // If assigned, send notification
    if (task.assignedEmployeeId) {
      await this.notifyAssignee(tenantId, task);
    }

    return task;
  }

  async findAll(
    tenantId: string,
    query: {
      projectId?: string;
      milestoneId?: string;
      assignedEmployeeId?: string;
      status?: TaskStatus;
      search?: string;
      skip?: number;
      take?: number;
    },
  ) {
    const { projectId, milestoneId, assignedEmployeeId, status, search, skip, take } = query;

    return this.prisma.task.findMany({
      where: {
        tenantId,
        projectId: projectId || undefined,
        milestoneId: milestoneId || undefined,
        assignedEmployeeId: assignedEmployeeId || undefined,
        status: status || undefined,
        OR: search
          ? [
              { title: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ]
          : undefined,
      },
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      include: {
        project: true,
        milestone: true,
        assignedEmployee: true,
        dependencies: {
          include: {
            predecessor: true,
          },
        },
        dependents: {
          include: {
            successor: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, tenantId },
      include: {
        project: true,
        milestone: true,
        assignedEmployee: true,
        dependencies: {
          include: {
            predecessor: true,
          },
        },
        dependents: {
          include: {
            successor: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async update(tenantId: string, id: string, updateTaskDto: UpdateTaskDto) {
    const task = await this.findOne(tenantId, id);

    // Verify milestone if provided
    if (updateTaskDto.milestoneId && updateTaskDto.milestoneId !== task.milestoneId) {
      const milestone = await this.prisma.milestone.findFirst({
        where: { id: updateTaskDto.milestoneId, projectId: task.projectId, tenantId },
      });
      if (!milestone) {
        throw new NotFoundException(`Milestone not found in this project`);
      }
    }

    // Verify employee if provided
    if (updateTaskDto.assignedEmployeeId && updateTaskDto.assignedEmployeeId !== task.assignedEmployeeId) {
      const employee = await this.prisma.employee.findFirst({
        where: { id: updateTaskDto.assignedEmployeeId, tenantId },
      });
      if (!employee) {
        throw new NotFoundException(`Employee not found`);
      }
    }

    const updated = await this.prisma.task.update({
      where: { id },
      data: {
        ...updateTaskDto,
        dueDate: updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : undefined,
      },
    });

    // Notify on assignment change
    if (updated.assignedEmployeeId && updated.assignedEmployeeId !== task.assignedEmployeeId) {
      await this.notifyAssignee(tenantId, updated);
    }

    // Notify managers on completion
    if (updated.status === TaskStatus.DONE && task.status !== TaskStatus.DONE) {
      await this.notifyManagersOfCompletion(tenantId, updated, task.project.name);
    }

    return updated;
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    return this.prisma.task.delete({
      where: { id },
    });
  }

  // Task Dependencies Management with Cycle Detection
  async addDependency(tenantId: string, dto: CreateTaskDependencyDto) {
    const predecessor = await this.findOne(tenantId, dto.predecessorTaskId);
    const successor = await this.findOne(tenantId, dto.successorTaskId);

    if (predecessor.projectId !== successor.projectId) {
      throw new BadRequestException('Tasks must belong to the same project to form dependencies.');
    }

    if (dto.predecessorTaskId === dto.successorTaskId) {
      throw new BadRequestException('A task cannot depend on itself.');
    }

    // Check if dependency already exists
    const existing = await this.prisma.taskDependency.findUnique({
      where: {
        predecessorTaskId_successorTaskId: {
          predecessorTaskId: dto.predecessorTaskId,
          successorTaskId: dto.successorTaskId,
        },
      },
    });
    if (existing) {
      return existing;
    }

    // Cycle detection: running DFS starting from predecessor to see if it can reach successor
    // Wait, if successor depends on predecessor, then successor must be executed AFTER predecessor.
    // Graph edge is predecessor -> successor.
    // If we want to add predecessor -> successor, a cycle exists if there is already a path from successor -> predecessor.
    const hasCycle = await this.detectCyclePath(dto.successorTaskId, dto.predecessorTaskId, new Set<string>());
    if (hasCycle) {
      throw new BadRequestException(
        `Circular dependency detected: Adding this dependency would cause a loop where task "${predecessor.title}" depends on task "${successor.title}", while "${successor.title}" already succeeds it.`,
      );
    }

    return this.prisma.taskDependency.create({
      data: {
        predecessorTaskId: dto.predecessorTaskId,
        successorTaskId: dto.successorTaskId,
      },
    });
  }

  async removeDependency(tenantId: string, predecessorTaskId: string, successorTaskId: string) {
    // Verify both tasks belong to tenant
    await this.findOne(tenantId, predecessorTaskId);
    await this.findOne(tenantId, successorTaskId);

    return this.prisma.taskDependency.delete({
      where: {
        predecessorTaskId_successorTaskId: {
          predecessorTaskId,
          successorTaskId,
        },
      },
    });
  }

  // DFS Cycle Detection helper
  private async detectCyclePath(currentTaskId: string, targetTaskId: string, visited: Set<string>): Promise<boolean> {
    if (currentTaskId === targetTaskId) {
      return true;
    }

    if (visited.has(currentTaskId)) {
      return false;
    }

    visited.add(currentTaskId);

    // Get all direct successor tasks
    const dependencies = await this.prisma.taskDependency.findMany({
      where: {
        predecessorTaskId: currentTaskId,
      },
    });

    for (const dep of dependencies) {
      const reached = await this.detectCyclePath(dep.successorTaskId, targetTaskId, visited);
      if (reached) {
        return true;
      }
    }

    return false;
  }

  private async notifyAssignee(tenantId: string, task: any) {
    // Find the user linked to this employee
    const user = await this.prisma.user.findFirst({
      where: {
        employeeId: task.assignedEmployeeId,
        tenantId,
      },
    });

    if (user) {
      try {
        await this.notificationService.create({
          userId: user.id,
          tenantId,
          type: 'INFO',
          title: 'Task Assigned',
          message: `You have been assigned to task "${task.title}" in project. Due Date: ${task.dueDate.toDateString()}`,
          link: `/projects/${task.projectId}/tasks`,
        });
      } catch (err) {
        console.error(`Failed to send task assignment alert to user ${user.id}`, err);
      }
    }
  }

  private async notifyManagersOfCompletion(tenantId: string, task: any, projectName: string) {
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
          type: 'SUCCESS',
          title: 'Task Completed',
          message: `Task "${task.title}" from project "${projectName}" has been completed.`,
          link: `/projects/${task.projectId}`,
        });
      } catch (err) {
        console.error(`Failed to send task completion notification to user ${manager.id}`, err);
      }
    }
  }
}
