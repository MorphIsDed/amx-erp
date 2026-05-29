import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationService } from './notification.service';
import { NotificationType } from '@repo/db';

@Injectable()
export class NotificationListener {
  constructor(private notificationService: NotificationService) {}

  @OnEvent('invoice.created', { async: true })
  async handleInvoiceCreated(payload: any) {
    const { invoice, userId } = payload;
    await this.notificationService.create({
      userId: userId || '',
      tenantId: invoice.tenantId,
      type: NotificationType.SUCCESS,
      title: 'New Invoice Created',
      message: `Invoice ${invoice.invoiceNumber} has been successfully generated for ${invoice.clientName}.`,
      link: `/finance/invoices`,
    });
  }

  @OnEvent('invoice.status.updated', { async: true })
  async handleInvoiceStatusUpdated(payload: any) {
    const { invoice, userId } = payload;
    const isApproved = invoice.status === 'APPROVED';
    await this.notificationService.create({
      userId: userId || '',
      tenantId: invoice.tenantId,
      type: isApproved ? NotificationType.SUCCESS : NotificationType.INFO,
      title: isApproved ? 'Invoice Approved' : 'Invoice Status Updated',
      message: `Invoice ${invoice.invoiceNumber} has been updated to ${invoice.status}.`,
      link: `/finance/invoices`,
    });
  }

  @OnEvent('invoice.paid', { async: true })
  async handleInvoicePaid(payload: any) {
    const { invoice, amountPaid, tenantId, userId } = payload;
    await this.notificationService.create({
      userId: userId || '',
      tenantId,
      type: NotificationType.SUCCESS,
      title: 'Invoice Payment Received',
      message: `Payment of ${amountPaid} received for invoice ${invoice.invoiceNumber}.`,
      link: `/finance/invoices`,
    });
  }

  @OnEvent('payroll.run.completed', { async: true })
  async handlePayrollCompleted(payload: any) {
    const run = payload;
    await this.notificationService.create({
      userId: '', // Broad notification (empty triggers general alert or we can find HR admin)
      tenantId: run.tenantId,
      type: NotificationType.SUCCESS,
      title: 'Payroll Completed',
      message: `Payroll run for period ${new Date(run.periodStart).toLocaleDateString()} - ${new Date(run.periodEnd).toLocaleDateString()} has been completed.`,
      link: `/hr`,
    });
  }

  @OnEvent('inventory.low_stock', { async: true })
  async handleLowStock(payload: any) {
    const { tenantId, name, sku, stockLevel, reorderLevel } = payload;
    await this.notificationService.create({
      userId: '',
      tenantId,
      type: NotificationType.WARNING,
      title: 'Low Stock Alert',
      message: `Product ${name} (SKU: ${sku}) has fallen below reorder level. Current: ${stockLevel}, Reorder: ${reorderLevel}.`,
      link: `/supply-chain/inventory`,
    });
  }

  @OnEvent('purchase-order.approved', { async: true })
  async handlePOApproved(payload: any) {
    const po = payload;
    await this.notificationService.create({
      userId: '',
      tenantId: po.tenantId,
      type: NotificationType.SUCCESS,
      title: 'Purchase Order Approved',
      message: `Purchase Order ${po.poNumber} has been approved.`,
      link: `/supply-chain/purchase-orders`,
    });
  }

  @OnEvent('leave.approved', { async: true })
  async handleLeaveApproved(payload: any) {
    const { leave, tenantId, userId } = payload;
    await this.notificationService.create({
      userId: leave.employeeId, // Notify employee
      tenantId,
      type: NotificationType.SUCCESS,
      title: 'Leave Request Approved',
      message: `Your leave request from ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()} has been approved.`,
      link: `/hr`,
    });
  }
}
