import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Subject } from 'rxjs';
import { NotificationType } from '@repo/db';

export interface CreateNotificationOptions {
  userId: string;
  tenantId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

@Injectable()
export class NotificationService {
  private notificationStream = new Subject<any>();

  constructor(private prisma: PrismaService) {}

  async create(options: CreateNotificationOptions) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: options.userId,
        tenantId: options.tenantId,
        type: options.type,
        title: options.title,
        message: options.message,
        link: options.link,
      },
    });

    // Push to real-time stream
    this.notificationStream.next({
      userId: options.userId,
      tenantId: options.tenantId,
      notification,
    });

    return notification;
  }

  async findAll(tenantId: string, userId: string) {
    return this.prisma.notification.findMany({
      where: { tenantId, userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async markAsRead(tenantId: string, userId: string, id: string) {
    return this.prisma.notification.updateMany({
      where: { id, tenantId, userId },
      data: { read: true },
    });
  }

  async getUnreadCount(tenantId: string, userId: string) {
    return this.prisma.notification.count({
      where: { tenantId, userId, read: false },
    });
  }

  getStream() {
    return this.notificationStream.asObservable();
  }
}
