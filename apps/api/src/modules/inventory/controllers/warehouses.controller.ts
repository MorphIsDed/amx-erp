import { Controller, Get, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import { InventoryService } from '../services/inventory.service';
import { CreateWarehouseDto } from '../dto/inventory.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { Role } from '@repo/db';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Inventory - Warehouses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory/warehouses')
export class WarehousesController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Create a new warehouse' })
  create(@Request() req: any, @Body() dto: CreateWarehouseDto) {
    return this.inventoryService.createWarehouse(req.user.tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all warehouses' })
  findAll(@Request() req: any) {
    return this.inventoryService.getWarehouses(req.user.tenantId);
  }

  @Get(':id/stock')
  @ApiOperation({ summary: 'Get current stock in a specific warehouse' })
  getStock(@Request() req: any, @Param('id') id: string) {
    return this.inventoryService.getStockByWarehouse(req.user.tenantId, id);
  }
}
