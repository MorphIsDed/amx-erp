import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PurchaseOrderStatus, StockMovementType } from '@repo/db';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(tenantId: string, data: any) {
    const { items, ...poData } = data;

    const po = await this.prisma.purchaseOrder.create({
      data: {
        ...poData,
        tenantId,
        items: {
          create: items.map((item: any) => ({
            ...item,
            totalPrice: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        items: {
          include: { product: true },
        },
        vendor: true,
        warehouse: true,
      },
    });

    this.eventEmitter.emit('purchase-order.created', po);
    return po;
  }

  async updateStatus(
    tenantId: string,
    id: string,
    status: PurchaseOrderStatus,
  ) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { id, tenantId },
      include: { items: true },
    });

    if (!po) throw new NotFoundException('Purchase Order not found');

    const updatedPo = await this.prisma.purchaseOrder.update({
      where: { id },
      data: { status },
      include: {
        items: { include: { product: true } },
        vendor: true,
        warehouse: true,
      },
    });

    this.eventEmitter.emit(`purchase-order.${status.toLowerCase()}`, updatedPo);

    // AUTOMATED STOCK INTEGRATION: If received, update stock
    if (status === PurchaseOrderStatus.RECEIVED) {
      await this.handleGoodsReceipt(tenantId, updatedPo);
    }

    return updatedPo;
  }

  private async handleGoodsReceipt(tenantId: string, po: any) {
    const movements = po.items.map((item: any) => ({
      tenantId,
      productId: item.productId,
      warehouseId: po.warehouseId,
      type: StockMovementType.IN,
      quantity: item.quantity,
      reference: po.poNumber,
      reason: `Received from Purchase Order ${po.poNumber}`,
    }));

    await this.prisma.stockMovement.createMany({
      data: movements,
    });

    this.eventEmitter.emit('inventory.batch_update', { tenantId, movements });
  }

  async findAll(tenantId: string) {
    return this.prisma.purchaseOrder.findMany({
      where: { tenantId },
      include: {
        vendor: true,
        warehouse: true,
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
