import { Module } from '@nestjs/common';
import { InventoryService } from './services/inventory.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
