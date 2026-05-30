import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Param,
  Put,
} from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '@repo/db';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('HR - Payroll')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('hr/payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post('run')
  @Roles(Role.ADMIN, Role.HR)
  @ApiOperation({ summary: 'Initiate a new payroll run' })
  createRun(
    @Request() req: any,
    @Body() body: { periodStart: string; periodEnd: string },
  ) {
    return this.payrollService.createPayrollRun(req.user.tenantId, {
      periodStart: new Date(body.periodStart),
      periodEnd: new Date(body.periodEnd),
    });
  }

  @Get('runs')
  @Roles(Role.ADMIN, Role.HR, Role.MANAGER)
  @ApiOperation({ summary: 'Get all payroll runs' })
  findAll(@Request() req: any) {
    return this.payrollService.getPayrollRuns(req.user.tenantId);
  }

  @Get('runs/:id')
  @Roles(Role.ADMIN, Role.HR, Role.MANAGER)
  @ApiOperation({ summary: 'Get details of a specific payroll run' })
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.payrollService.getPayrollDetails(req.user.tenantId, id);
  }

  @Put('runs/:id/process')
  @Roles(Role.ADMIN, Role.HR)
  @ApiOperation({ summary: 'Finalize and process a payroll run' })
  process(@Request() req: any, @Param('id') id: string) {
    return this.payrollService.processPayroll(req.user.tenantId, id);
  }

  @Get('kpis/monthly')
  @Roles(Role.ADMIN, Role.HR)
  @ApiOperation({ summary: 'Get monthly payroll cost trends' })
  getMonthlyCost(@Request() req: any) {
    return this.payrollService.getMonthlyPayrollCost(req.user.tenantId);
  }

  @Get('kpis/department')
  @Roles(Role.ADMIN, Role.HR)
  @ApiOperation({ summary: 'Get payroll cost distribution by department' })
  getDeptCost(@Request() req: any) {
    return this.payrollService.getDepartmentPayrollCost(req.user.tenantId);
  }

  @Get('kpis/employee/:employeeId')
  @Roles(Role.ADMIN, Role.HR, Role.MANAGER, Role.EMPLOYEE)
  @ApiOperation({ summary: 'Get payroll history for a specific employee' })
  getEmpHistory(@Request() req: any, @Param('employeeId') employeeId: string) {
    return this.payrollService.getEmployeePayrollHistory(
      req.user.tenantId,
      employeeId,
    );
  }
}
