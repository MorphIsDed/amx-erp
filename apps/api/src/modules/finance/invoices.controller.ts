import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto, UpdateInvoiceStatusDto } from './dto/invoice.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '@repo/db';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Finance - Invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('finance/invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.FINANCE)
  @ApiOperation({ summary: 'Create a new invoice' })
  create(@Request() req: any, @Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoicesService.create(req.user.tenantId, createInvoiceDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.FINANCE, Role.MANAGER)
  @ApiOperation({ summary: 'Get all invoices' })
  findAll(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.invoicesService.findAll(req.user.tenantId, {
      status,
      skip,
      take,
    });
  }

  @Get('stats')
  @Roles(Role.ADMIN, Role.FINANCE, Role.MANAGER)
  @ApiOperation({ summary: 'Get invoicing statistics' })
  getStats(@Request() req: any) {
    return this.invoicesService.getStats(req.user.tenantId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.FINANCE, Role.MANAGER)
  @ApiOperation({ summary: 'Get an invoice by ID' })
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.invoicesService.findOne(req.user.tenantId, id);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.FINANCE)
  @ApiOperation({ summary: 'Update invoice status' })
  updateStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateInvoiceStatusDto,
  ) {
    return this.invoicesService.updateStatus(req.user.tenantId, id, dto);
  }
}
