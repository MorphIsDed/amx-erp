import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notifications/notification.service';
import { CreateMilestoneDto, UpdateMilestoneDto } from './dto/project.dto';
import { MilestoneStatus, Role } from '@repo/db';

@Injectable()
export class MilestonesService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async create(tenantId: string, createMilestoneDto: CreateMilestoneDto) {
    // Verify project belongs to tenant
    const project = await this.prisma.project.findFirst({
      where: { id: createMilestoneDto.projectId, tenantId, deletedAt: null },
    });
    if (!project) {
      throw new NotFoundException(`Project not found`);
    }

    const milestone = await this.prisma.milestone.create({
      data: {
        ...createMilestoneDto,
        tenantId,
        dueDate: new Date(createMilestoneDto.dueDate),
      },
    });

    await this.notifyManagers(tenantId, {
      title: 'Milestone Created',
      message: `A new milestone "${milestone.name}" has been created for project "${project.name}".`,
      projectId: project.id,
    });

    return milestone;
  }

  async findAll(tenantId: string, projectId?: string) {
    return this.prisma.milestone.findMany({
      where: {
        tenantId,
        projectId: projectId || undefined,
      },
      include: {
        project: true,
        _count: {
          select: {
            tasks: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const milestone = await this.prisma.milestone.findFirst({
      where: { id, tenantId },
      include: {
        project: true,
        tasks: true,
      },
    });

    if (!milestone) {
      throw new NotFoundException(`Milestone with ID ${id} not found`);
    }

    return milestone;
  }

  async update(tenantId: string, id: string, updateMilestoneDto: UpdateMilestoneDto) {
    const milestone = await this.findOne(tenantId, id);

    const completedAt =
      updateMilestoneDto.status === MilestoneStatus.COMPLETED
        ? new Date()
        : updateMilestoneDto.status
        ? null
        : undefined;

    const updated = await this.prisma.milestone.update({
      where: { id },
      data: {
        ...updateMilestoneDto,
        dueDate: updateMilestoneDto.dueDate ? new Date(updateMilestoneDto.dueDate) : undefined,
        completedAt,
      },
    });

    // Alert on status change
    if (updateMilestoneDto.status && updateMilestoneDto.status !== milestone.status) {
      if (updateMilestoneDto.status === MilestoneStatus.COMPLETED) {
        await this.notifyManagers(tenantId, {
          title: 'Milestone Completed',
          message: `Milestone "${updated.name}" of project "${milestone.project.name}" has been successfully completed.`,
          projectId: milestone.projectId,
        });
      } else if (updateMilestoneDto.status === MilestoneStatus.DELAYED) {
        await this.notifyManagers(tenantId, {
          title: 'Milestone Delayed Alert',
          message: `Milestone "${updated.name}" of project "${milestone.project.name}" is marked as DELAYED. Due date was ${updated.dueDate.toDateString()}`,
          projectId: milestone.projectId,
          type: 'WARNING',
        });
      }
    }

    return updated;
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    return this.prisma.milestone.delete({
      where: { id },
    });
  }

  private async notifyManagers(
    tenantId: string,
    notification: { title: string; message: string; projectId: string; type?: string },
  ) {
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
          type: (notification.type as any) || 'INFO',
          title: notification.title,
          message: notification.message,
          link: `/projects/${notification.projectId}`,
        });
      } catch (err) {
        console.error(`Failed to send milestone notification to user ${manager.id}`, err);
      }
    }
  }
}
