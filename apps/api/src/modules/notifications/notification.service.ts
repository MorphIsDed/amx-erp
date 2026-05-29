import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
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

  constructor(
    private prisma: PrismaService,
    @InjectQueue('notifications') private readonly notificationsQueue: Queue,
  ) {}

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

    // Determine channels (defaulting to IN_APP for now if no preferences found, plus EMAIL/WEBHOOK to demonstrate feature)
    const channels = ['IN_APP', 'EMAIL', 'WEBHOOK'];

    for (const channel of channels) {
      await this.prisma.notificationDelivery.create({
        data: {
          notificationId: notification.id,
          channel: channel as any,
          status: 'PENDING',
        },
      });

      if (channel === 'IN_APP') {
        // Push to real-time stream
        this.notificationStream.next({
          userId: options.userId,
          tenantId: options.tenantId,
          notification,
        });
      } else {
        // Dispatch to BullMQ
        await this.notificationsQueue.add('deliver', {
          notificationId: notification.id,
          channel,
          tenantId: options.tenantId,
          payload: {
            title: options.title,
            message: options.message,
            link: options.link,
          },
        });
      }
    }

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
