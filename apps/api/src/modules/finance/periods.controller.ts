import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PeriodsService } from './periods.service';
import { CreatePeriodDto } from './dto/finance.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '@repo/db';

@ApiTags('Finance - Periods')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('finance/periods')
export class PeriodsController {
  constructor(private readonly periodsService: PeriodsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.FINANCE)
  @ApiOperation({ summary: 'Create accounting period' })
  create(@Request() req: any, @Body() dto: CreatePeriodDto) {
    return this.periodsService.createPeriod(req.user.tenantId, dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.FINANCE, Role.MANAGER)
  @ApiOperation({ summary: 'Get all accounting periods' })
  findAll(@Request() req: any) {
    return this.periodsService.findAll(req.user.tenantId, {});
  }

  @Patch(':id/close')
  @Roles(Role.ADMIN, Role.FINANCE)
  @ApiOperation({ summary: 'Close accounting period' })
  close(@Request() req: any, @Param('id') id: string) {
    return this.periodsService.closePeriod(req.user.tenantId, id);
  }
}
