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
import { RecordPaymentDto } from './dto/finance.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '@repo/db';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InvoiceOCRService } from './invoice-ocr.service';
import { ThreeWayMatchingService } from './three-way-matching.service';

@ApiTags('Finance - Invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('finance/invoices')
export class InvoicesController {
  constructor(
    private readonly invoicesService: InvoicesService,
    private readonly ocrService: InvoiceOCRService,
    private readonly matchingService: ThreeWayMatchingService,
  ) {}

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

  @Post('ocr-upload')
  @Roles(Role.ADMIN, Role.FINANCE)
  @ApiOperation({
    summary: 'Semantic layout parsing OCR for Invoice uploaded raw text/file',
  })
  async ocrUpload(
    @Request() req: any,
    @Body() body: { fileName?: string; base64Content?: string },
  ) {
    const buffer = body.base64Content
      ? Buffer.from(body.base64Content, 'base64')
      : Buffer.from(
          'vendor: Acme Inc\ninvoice no: INV-9900\ntax: 270\ntotal: 1500\n',
          'utf8',
        );
    const fileName = body.fileName || 'invoice_attachment.txt';
    return this.ocrService.parseInvoice(buffer, fileName);
  }

  @Post(':id/verify-match/:poId')
  @Roles(Role.ADMIN, Role.FINANCE)
  @ApiOperation({
    summary: 'Perform 3-Way Matching validation (PO vs GR vs Invoice)',
  })
  verifyMatch(
    @Request() req: any,
    @Param('id') invoiceId: string,
    @Param('poId') poId: string,
  ) {
    return this.matchingService.performThreeWayMatch(
      req.user.tenantId,
      invoiceId,
      poId,
    );
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

  @Post(':id/payments')
  @Roles(Role.ADMIN, Role.FINANCE)
  @ApiOperation({ summary: 'Record a payment on invoice' })
  recordPayment(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: RecordPaymentDto,
  ) {
    return this.invoicesService.recordPayment(
      req.user.tenantId,
      id,
      dto.amount,
      req.user.id,
    );
  }
}
