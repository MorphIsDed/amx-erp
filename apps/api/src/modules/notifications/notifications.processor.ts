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
        // Implement webhook logic
        this.logger.log(`Sending WEBHOOK notification for ${notificationId}`);
        // await webhookService.post(...)
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
