import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('webhooks') private readonly webhooksQueue: Queue,
  ) {}

  /**
   * Create a new webhook subscription
   */
  async subscribe(tenantId: string, url: string, secret: string, eventTypes: string[]) {
    return this.prisma.webhookSubscription.create({
      data: {
        tenantId,
        url,
        secret,
        eventTypes,
      },
    });
  }

  /**
   * List all subscriptions for a tenant
   */
  async getSubscriptions(tenantId: string) {
    return this.prisma.webhookSubscription.findMany({
      where: { tenantId, isActive: true },
    });
  }

  /**
   * Delete subscription
   */
  async unsubscribe(tenantId: string, id: string) {
    return this.prisma.webhookSubscription.updateMany({
      where: { id, tenantId },
      data: { isActive: false },
    });
  }

  /**
   * Core Event Listeners to intercept system actions and enqueue webhooks
   */

  @OnEvent('invoice.paid')
  async handleInvoicePaid(payload: any) {
    await this.dispatch('invoice.paid', payload.tenantId, payload);
  }

  @OnEvent('invoice.created')
  async handleInvoiceCreated(payload: any) {
    await this.dispatch('invoice.created', payload.invoice.tenantId, payload);
  }

  @OnEvent('leave.status.updated')
  async handleLeaveStatusUpdated(payload: any) {
    // Only dispatch webhook if leave is approved
    if (payload.leave?.status === 'APPROVED') {
      await this.dispatch('leave.approved', payload.tenantId, payload);
    }
  }

  @OnEvent('task.status.updated')
  async handleTaskStatusUpdated(payload: any) {
    // Only dispatch webhook if task is done
    if (payload.task?.status === 'DONE') {
      await this.dispatch('task.completed', payload.tenantId, payload);
    }
  }

  /**
   * Enqueue event to BullMQ
   */
  private async dispatch(eventType: string, tenantId: string, payload: any) {
    this.logger.log(`Dispatching webhook event: ${eventType} for tenant: ${tenantId}`);
    
    // Find active subscriptions for this tenant subscribing to this event type
    const subscriptions = await this.prisma.webhookSubscription.findMany({
      where: {
        tenantId,
        isActive: true,
        eventTypes: {
          has: eventType,
        },
      },
    });

    for (const sub of subscriptions) {
      await this.webhooksQueue.add(
        'dispatch',
        {
          subscriptionId: sub.id,
          url: sub.url,
          secret: sub.secret,
          eventType,
          payload,
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 60000, // Start with 1 minute, BullMQ will exponentially scale (1m, 5m, 15m)
          },
        },
      );
    }
  }
}
