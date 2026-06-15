import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Processor('notifications')
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { notificationId, channel } = job.data;

    this.logger.log(
      `Processing notification job ${job.id} for channel ${channel}`,
    );

    try {
      if (channel === 'EMAIL') {
        // Implement email logic
        this.logger.log(`Sending EMAIL notification for ${notificationId}`);
        // await emailService.send(...)
      } else if (channel === 'WEBHOOK') {
        this.logger.log(`Sending WEBHOOK notification for ${notificationId}`);

        const notification = await this.prisma.notification.findUnique({
          where: { id: notificationId },
        });

        if (notification) {
          const subscriptions = await this.prisma.webhookSubscription.findMany({
            where: {
              tenantId: notification.tenantId,
              isActive: true,
            },
          });

          const payload = JSON.stringify({
            id: notification.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            link: notification.link,
            createdAt: notification.createdAt,
          });

          for (const sub of subscriptions) {
            try {
              const response = await fetch(sub.url, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-amx-signature': 'signature-placeholder', // In prod, generate HMAC using sub.secret
                },
                body: payload,
              });

              if (!response.ok) {
                throw new Error(
                  `HTTP ${response.status} ${response.statusText}`,
                );
              }
              this.logger.log(`Successfully dispatched webhook to ${sub.url}`);
            } catch (webhookErr: any) {
              this.logger.error(
                `Failed to dispatch webhook to ${sub.url}: ${webhookErr.message}`,
              );
              throw webhookErr; // Trigger BullMQ retry
            }
          }
        }
      }

      await this.prisma.notificationDelivery.updateMany({
        where: { notificationId, channel },
        data: {
          status: 'DELIVERED',
          deliveredAt: new Date(),
          attempts: { increment: 1 },
        },
      });
    } catch (error: any) {
      this.logger.error(
        `Failed to process notification ${notificationId}: ${error.message}`,
      );

      await this.prisma.notificationDelivery.updateMany({
        where: { notificationId, channel },
        data: {
          status: 'FAILED',
          lastError: error.message,
          attempts: { increment: 1 },
        },
      });

      throw error; // Trigger BullMQ retry
    }
  }
}
