import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { PurchaseOrdersService } from '../services/purchase-orders.service';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { Role, PurchaseOrderStatus } from '@repo/db';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Inventory - Purchase Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory/purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly poService: PurchaseOrdersService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Create a new purchase order' })
  create(@Request() req: any, @Body() dto: any) {
    return this.poService.create(req.user.tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all purchase orders' })
  findAll(@Request() req: any) {
    return this.poService.findAll(req.user.tenantId);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Update purchase order status' })
  updateStatus(
    @Request() req: any, 
    @Param('id') id: string, 
    @Body('status') status: PurchaseOrderStatus
  ) {
    return this.poService.updateStatus(req.user.tenantId, id, status);
  }
}
