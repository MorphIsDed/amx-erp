import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInvoiceDto, UpdateInvoiceStatusDto } from './dto/invoice.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class InvoicesService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(tenantId: string, dto: CreateInvoiceDto) {
    let subTotal = 0;
    let taxTotal = 0;

    const itemsData = dto.items.map((item) => {
      const amount = item.quantity * item.unitPrice;
      const taxAmount = amount * ((item.taxRate || 0) / 100);
      subTotal += amount;
      taxTotal += taxAmount;

      return {
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate || 0,
        amount: amount,
      };
    });

    const totalAmount = subTotal + taxTotal;

    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceNumber: dto.invoiceNumber,
        issueDate: new Date(dto.issueDate),
        dueDate: new Date(dto.dueDate),
        currency: dto.currency || 'INR',
        exchangeRate: dto.exchangeRate || 1.0,
        subTotal,
        taxTotal,
        totalAmount,
        clientName: dto.clientName,
        clientEmail: dto.clientEmail,
        clientAddress: dto.clientAddress,
        notes: dto.notes,
        tenantId,
        items: {
          create: itemsData,
        },
      },
      include: {
        items: true,
      },
    });

    this.eventEmitter.emit('invoice.created', invoice);

    return invoice;
  }

  async findAll(tenantId: string, query: { status?: any; skip?: number; take?: number }) {
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

  async updateStatus(tenantId: string, id: string, dto: UpdateInvoiceStatusDto) {
    return this.prisma.invoice.updateMany({
      where: { id, tenantId },
      data: { status: dto.status },
    });
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
      stats.outstanding += (inv.totalAmount - inv.amountPaid);
      if (inv.status === 'DRAFT') stats.draft += 1;
    });

    return stats;
  }
}
