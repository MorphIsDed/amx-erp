import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { InventoryService } from '../services/inventory.service';
import { RecordMovementDto } from '../dto/inventory.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { Role } from '@repo/db';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Inventory - Stock Movements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory/movements')
export class StockMovementsController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Record a stock movement (IN, OUT, ADJ, TRANS)' })
  record(@Request() req: any, @Body() dto: RecordMovementDto) {
    return this.inventoryService.recordMovement(req.user.tenantId, {
      ...dto,
      userId: req.user.userId,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get stock movement history (Ledger)' })
  findAll(
    @Request() req: any,
    @Query('productId') productId?: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('limit') limit?: number,
  ) {
    return this.inventoryService.getMovements(req.user.tenantId, {
      productId,
      warehouseId,
      limit,
    });
  }
}
