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

  async createWarehouse(tenantId: string, data: any) {
    return this.prisma.warehouse.create({
      data: { ...data, tenantId }
    });
  }

  async getWarehouses(tenantId: string) {
    return this.prisma.warehouse.findMany({
      where: { tenantId }
    });
  }

  async getMovements(tenantId: string, query: { productId?: string; warehouseId?: string; limit?: number }) {
    return this.prisma.stockMovement.findMany({
      where: {
        tenantId,
        productId: query.productId,
        warehouseId: query.warehouseId,
      },
      orderBy: { createdAt: 'desc' },
      take: query.limit || 50,
      include: {
        product: true,
        warehouse: true,
      }
    });
  }

  async getStockByWarehouse(tenantId: string, warehouseId: string) {
    const movements = await this.prisma.stockMovement.findMany({
      where: { tenantId, warehouseId },
      include: { product: true }
    });

    // Group by product and calculate
    const levels: Record<string, any> = {};
    movements.forEach(m => {
      if (!levels[m.productId]) {
        levels[m.productId] = { 
          product: m.product, 
          quantity: 0 
        };
      }
      const change = (m.type === StockMovementType.IN || m.type === StockMovementType.ADJUSTMENT) 
        ? m.quantity 
        : -m.quantity;
      levels[m.productId].quantity += change;
    });

    return Object.values(levels);
  }

  async getStockLevel(tenantId: string, productId: string) {
    const movements = await this.prisma.stockMovement.findMany({
      where: { tenantId, productId }
    });

    return movements.reduce((acc, curr) => {
      const change = (curr.type === StockMovementType.IN || curr.type === StockMovementType.ADJUSTMENT) 
        ? curr.quantity 
        : -curr.quantity;
      return acc + change;
    }, 0);
  }
}
