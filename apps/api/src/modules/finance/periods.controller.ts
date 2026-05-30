import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Headers,
} from '@nestjs/common';
import { PeriodsService } from './periods.service';
import { CreatePeriodDto } from './dto/finance.dto';
import { ApiTags, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';

@ApiTags('Finance - Periods')
@ApiBearerAuth()
@ApiHeader({ name: 'x-tenant-id', required: true, description: 'Tenant ID' })
@Controller('finance/periods')
export class PeriodsController {
  constructor(private readonly periodsService: PeriodsService) {}

  @Post()
  create(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreatePeriodDto,
  ) {
    return this.periodsService.createPeriod(tenantId, dto);
  }

  @Get()
  findAll(@Headers('x-tenant-id') tenantId: string) {
    return this.periodsService.findAll(tenantId, {});
  }

  @Patch(':id/close')
  close(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    return this.periodsService.closePeriod(tenantId, id);
  }
}
