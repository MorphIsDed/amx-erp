import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationService } from './notification.service';
import { NotificationType } from '@repo/db';

@Injectable()
export class NotificationListener {
  constructor(private notificationService: NotificationService) {}

  @OnEvent('invoice.created', { async: true })
  async handleInvoiceCreated(payload: any) {
    // Notify the tenant admins
    // For now, we'll assume we have a way to find admins.
    // Let's just create a notification for the person who created it as a placeholder,
    // or better, a system notification.
    await this.notificationService.create({
      userId: payload.userId || payload.adminId || '', // Need to ensure userId is passed
      tenantId: payload.tenantId,
      type: NotificationType.SUCCESS,
      title: 'New Invoice Created',
      message: `Invoice ${payload.invoiceNumber} has been successfully generated for ${payload.clientName}.`,
      link: `/finance/invoices/${payload.id}`,
    });
  }

  @OnEvent('invoice.paid', { async: true })
  async handleInvoicePaid(payload: any) {
    await this.notificationService.create({
      userId: payload.userId || '',
      tenantId: payload.tenantId,
      type: NotificationType.SUCCESS,
      title: 'Payment Received',
      message: `Payment of ${payload.amountPaid} received for invoice ${payload.invoiceNumber}.`,
      link: `/finance/invoices/${payload.id}`,
    });
  }
}
