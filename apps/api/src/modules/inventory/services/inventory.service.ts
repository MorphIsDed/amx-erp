import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { StockMovementType } from '@repo/db';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { fromEvent } from 'rxjs';

@Injectable()
export class InventoryService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async createProduct(tenantId: string, data: any) {
    const existing = await this.prisma.product.findFirst({
      where: { tenantId, sku: data.sku },
    });
    if (existing)
      throw new ConflictException('Product with this SKU already exists');

    const product = await this.prisma.product.create({
      data: { ...data, tenantId },
    });

    this.eventEmitter.emit('inventory.product.created', product);
    return product;
  }

  async getProducts(tenantId: string) {
    return this.prisma.product.findMany({
      where: { tenantId },
      include: { vendor: true },
    });
  }

  async recordMovement(
    tenantId: string,
    data: {
      productId: string;
      warehouseId: string;
      type: StockMovementType;
      quantity: number;
      reference?: string;
      reason?: string;
      userId?: string;
    },
  ) {
    const movement = await this.prisma.stockMovement.create({
      data: { ...data, tenantId },
    });

    this.eventEmitter.emit('inventory.movement.created', movement);

    // Emit real-time stock update
    const newStockLevel = await this.getStockLevel(tenantId, data.productId);
    this.eventEmitter.emit('inventory.stock.updated', {
      tenantId,
      payload: {
        productId: data.productId,
        stockLevel: newStockLevel,
        movement,
      },
    });

    // Reorder Automation Check
    const product = await this.prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (product && newStockLevel <= product.reorderLevel) {
      this.eventEmitter.emit('inventory.low_stock', {
        tenantId,
        productId: product.id,
        sku: product.sku,
        name: product.name,
        stockLevel: newStockLevel,
        reorderLevel: product.reorderLevel,
      });

      if (product.vendorId) {
        const existingDraftPo = await this.prisma.purchaseOrder.findFirst({
          where: {
            tenantId,
            status: 'DRAFT',
            vendorId: product.vendorId,
            items: {
              some: {
                productId: product.id,
              },
            },
          },
        });

        if (!existingDraftPo) {
          const defaultWarehouse = await this.prisma.warehouse.findFirst({
            where: { tenantId },
          });

          if (defaultWarehouse) {
            await this.prisma.purchaseOrder.create({
              data: {
                poNumber: `AUTO-PO-${Date.now()}`,
                orderDate: new Date(),
                status: 'DRAFT',
                totalAmount: product.price * 10,
                tenantId,
                vendorId: product.vendorId,
                warehouseId: defaultWarehouse.id,
                items: {
                  create: [
                    {
                      quantity: 10,
                      unitPrice: product.price,
                      totalPrice: product.price * 10,
                      productId: product.id,
                    },
                  ],
                },
              },
            });
          }
        }
      }
    }

    return movement;
  }

  getStockStream() {
    return fromEvent(this.eventEmitter, 'inventory.stock.updated');
  }

  async createWarehouse(tenantId: string, data: any) {
    return this.prisma.warehouse.create({
      data: { ...data, tenantId },
    });
  }

  async getWarehouses(tenantId: string) {
    return this.prisma.warehouse.findMany({
      where: { tenantId },
    });
  }

  async getMovements(
    tenantId: string,
    query: { productId?: string; warehouseId?: string; limit?: number },
  ) {
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
      },
    });
  }

  async getStockByWarehouse(tenantId: string, warehouseId: string) {
    const movements = await this.prisma.stockMovement.findMany({
      where: { tenantId, warehouseId },
      include: { product: true },
    });

    // Group by product and calculate
    const levels: Record<string, any> = {};
    movements.forEach((m) => {
      if (!levels[m.productId]) {
        levels[m.productId] = {
          product: m.product,
          quantity: 0,
        };
      }
      const change =
        m.type === StockMovementType.IN ||
        m.type === StockMovementType.ADJUSTMENT
          ? m.quantity
          : -m.quantity;
      levels[m.productId].quantity += change;
    });

    return Object.values(levels);
  }

  async getStockLevel(tenantId: string, productId: string) {
    const movements = await this.prisma.stockMovement.findMany({
      where: { tenantId, productId },
    });

    return movements.reduce((acc, curr) => {
      const change =
        curr.type === StockMovementType.IN ||
        curr.type === StockMovementType.ADJUSTMENT
          ? curr.quantity
          : -curr.quantity;
      return acc + change;
    }, 0);
  }

  async getDashboardStats(tenantId: string) {
    const products = await this.prisma.product.count({ where: { tenantId } });
    const warehouses = await this.prisma.warehouse.count({
      where: { tenantId },
    });
    const recentMovements = await this.prisma.stockMovement.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { product: true },
    });

    // Total Stock Valuation (Aggregated)
    const allMovements = await this.prisma.stockMovement.findMany({
      where: { tenantId },
      include: { product: true },
    });

    const valuation = allMovements.reduce((acc, curr) => {
      const change =
        curr.type === StockMovementType.IN ||
        curr.type === StockMovementType.ADJUSTMENT
          ? curr.quantity
          : -curr.quantity;
      return acc + change * (curr.product.price || 0);
    }, 0);

    // Warehouse Distribution
    const allWarehouses = await this.prisma.warehouse.findMany({
      where: { tenantId },
      include: { stockMovements: { include: { product: true } } },
    });

    const distribution = allWarehouses.map((w) => {
      const level = w.stockMovements.reduce((acc, curr) => {
        const change =
          curr.type === StockMovementType.IN ||
          curr.type === StockMovementType.ADJUSTMENT
            ? curr.quantity
            : -curr.quantity;
        return acc + change;
      }, 0);
      return { id: w.id, name: w.name, level };
    });

    return {
      products,
      warehouses,
      totalValuation: valuation,
      recentMovements,
      distribution,
    };
  }
}
