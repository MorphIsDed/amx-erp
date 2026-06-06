import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '@repo/db';

@ApiTags('Finance - Transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('finance/transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.FINANCE)
  @ApiOperation({ summary: 'Create a transaction' })
  create(@Request() req: any, @Body() data: any) {
    return this.transactionsService.create(req.user.tenantId, data);
  }

  @Get()
  @Roles(Role.ADMIN, Role.FINANCE, Role.MANAGER)
  @ApiOperation({ summary: 'Get all transactions' })
  findAll(
    @Request() req: any,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.transactionsService.findAll(req.user.tenantId, {
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      orderBy: { date: 'desc' },
    });
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.FINANCE, Role.MANAGER)
  @ApiOperation({ summary: 'Get transaction by ID' })
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.transactionsService.findOne(req.user.tenantId, id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.FINANCE)
  @ApiOperation({ summary: 'Update transaction' })
  update(@Request() req: any, @Param('id') id: string, @Body() data: any) {
    return this.transactionsService.update(req.user.tenantId, id, data);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.FINANCE)
  @ApiOperation({ summary: 'Delete transaction' })
  remove(@Request() req: any, @Param('id') id: string) {
    return this.transactionsService.remove(req.user.tenantId, id);
  }
}
