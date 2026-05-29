import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInvoiceDto, UpdateInvoiceStatusDto } from './dto/invoice.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TaxEngine } from '../../common/utils/tax-engine';

@Injectable()
export class InvoicesService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(tenantId: string, dto: CreateInvoiceDto, userId?: string) {
    let subTotal = 0;

    // Calculate basic subtotal first
    dto.items.forEach((item) => {
      subTotal += item.quantity * item.unitPrice;
    });

    // Use TaxEngine to get unified GST data
    const taxData = TaxEngine.calculateGST(subTotal, 18); // Default 18% GST

    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceNumber: dto.invoiceNumber,
        issueDate: new Date(dto.issueDate),
        dueDate: new Date(dto.dueDate),
        currency: dto.currency || 'INR',
        exchangeRate: dto.exchangeRate || 1.0,
        subTotal: taxData.subTotal,
        taxTotal: taxData.totalTax,
        totalAmount: taxData.totalAmount,
        clientName: dto.clientName,
        clientEmail: dto.clientEmail,
        clientAddress: dto.clientAddress,
        notes: dto.notes,
        tenantId,
        items: {
          create: dto.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxRate: 18,
            amount: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    this.eventEmitter.emit('invoice.created', { invoice, userId });
    this.eventEmitter.emit('audit.log', {
      action: 'INVOICE_CREATED',
      entityType: 'INVOICE',
      entityId: invoice.id,
      tenantId,
      userId,
      details: {
        invoiceNumber: invoice.invoiceNumber,
        total: invoice.totalAmount,
      },
    });

    return invoice;
  }

  async findAll(
    tenantId: string,
    query: { status?: any; skip?: number; take?: number },
  ) {
    const { status, skip, take } = query;
    return this.prisma.invoice.findMany({
      where: {
        tenantId,
        status: status,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      include: {
        items: true,
      },
    });
  }

  async findOne(tenantId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, tenantId },
      include: { items: true },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    return invoice;
  }

  async updateStatus(
    tenantId: string,
    id: string,
    dto: UpdateInvoiceStatusDto,
    userId?: string,
  ) {
    const invoice = await this.prisma.invoice.update({
      where: { id },
      data: { status: dto.status },
    });

    this.eventEmitter.emit('invoice.status.updated', { invoice, userId });
    this.eventEmitter.emit('audit.log', {
      action: 'INVOICE_STATUS_CHANGED',
      entityType: 'INVOICE',
      entityId: invoice.id,
      tenantId,
      userId,
      details: { newStatus: dto.status },
    });

    return invoice;
  }

  async getStats(tenantId: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: { tenantId },
      select: {
        status: true,
        totalAmount: true,
        amountPaid: true,
      },
    });

    const stats = {
      totalRevenue: 0,
      outstanding: 0,
      paid: 0,
      draft: 0,
    };

    invoices.forEach((inv) => {
      stats.totalRevenue += inv.totalAmount;
      stats.paid += inv.amountPaid;
      stats.outstanding += inv.totalAmount - inv.amountPaid;
      if (inv.status === 'DRAFT') stats.draft += 1;
    });

    return stats;
  }
}
