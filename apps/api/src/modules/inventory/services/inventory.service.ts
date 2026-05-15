import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { StockMovementType } from '@repo/db';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class InventoryService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2
  ) {}

  async createProduct(tenantId: string, data: any) {
    const existing = await this.prisma.product.findFirst({
      where: { tenantId, sku: data.sku }
    });
    if (existing) throw new ConflictException('Product with this SKU already exists');

    const product = await this.prisma.product.create({
      data: { ...data, tenantId }
    });

    this.eventEmitter.emit('inventory.product.created', product);
    return product;
  }

  async getProducts(tenantId: string) {
    return this.prisma.product.findMany({
      where: { tenantId },
      include: { vendor: true }
    });
  }

  async recordMovement(tenantId: string, data: {
    productId: string;
    warehouseId: string;
    type: StockMovementType;
    quantity: number;
    reference?: string;
    reason?: string;
    userId?: string;
  }) {
    const movement = await this.prisma.stockMovement.create({
      data: { ...data, tenantId }
    });

    this.eventEmitter.emit('inventory.movement.created', movement);
    return movement;
  }

  async getStockLevel(tenantId: string, productId: string) {
    const movements = await this.prisma.stockMovement.findMany({
      where: { tenantId, productId }
    });

    return movements.reduce((acc, curr) => {
      if (curr.type === StockMovementType.IN || curr.type === StockMovementType.ADJUSTMENT) {
        return acc + curr.quantity;
      }
      return acc - curr.quantity;
    }, 0);
  }
}
