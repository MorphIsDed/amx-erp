import { Module } from '@nestjs/common';
import { InventoryService } from './services/inventory.service';
import { PurchaseOrdersService } from './services/purchase-orders.service';
import { ProductsController } from './controllers/products.controller';
import { WarehousesController } from './controllers/warehouses.controller';
import { StockMovementsController } from './controllers/movements.controller';
import { PurchaseOrdersController } from './controllers/purchase-orders.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [
    ProductsController,
    WarehousesController,
    StockMovementsController,
    PurchaseOrdersController,
  ],
  providers: [InventoryService, PurchaseOrdersService],
  exports: [InventoryService, PurchaseOrdersService],
})
export class InventoryModule {}
