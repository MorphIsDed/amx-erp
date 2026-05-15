import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface ActivityLogOptions {
  action: string;
  entityType: string;
  entityId?: string;
  details?: any;
  userId?: string;
  tenantId: string;
}

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  async log(options: ActivityLogOptions) {
    try {
      return await this.prisma.activityLog.create({
        data: {
          action: options.action,
          entityType: options.entityType,
          entityId: options.entityId,
          details: options.details || {},
          userId: options.userId,
          tenantId: options.tenantId,
        },
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
      // We don't throw here to avoid breaking the main business flow
    }
  }

  async findByTenant(tenantId: string, limit = 50) {
    return this.prisma.activityLog.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  }
}
