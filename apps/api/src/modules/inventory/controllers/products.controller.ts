import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Param,
  Sse,
} from '@nestjs/common';
import { InventoryService } from '../services/inventory.service';
import { CreateProductDto } from '../dto/inventory.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { Role } from '@repo/db';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { map, filter } from 'rxjs/operators';

@ApiTags('Inventory - Products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory/products')
export class ProductsController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Create a new product' })
  create(@Request() req: any, @Body() dto: CreateProductDto) {
    return this.inventoryService.createProduct(req.user.tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  findAll(@Request() req: any) {
    return this.inventoryService.getProducts(req.user.tenantId);
  }

  @Get(':id/stock')
  @ApiOperation({ summary: 'Get current stock level for a product' })
  getStock(@Request() req: any, @Param('id') id: string) {
    return this.inventoryService.getStockLevel(req.user.tenantId, id);
  }

  @Sse('stream')
  @ApiOperation({ summary: 'Real-time inventory stock stream (SSE)' })
  stream(@Request() req: any) {
    return this.inventoryService.getStockStream().pipe(
      filter((data: any) => data.tenantId === req.user.tenantId),
      map((data: any) => ({ data: data.payload })),
    );
  }
}
