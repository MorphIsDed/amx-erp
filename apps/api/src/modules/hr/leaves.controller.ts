import { Controller, Get, Post, Patch, Body, Param, Headers, Request, UseGuards } from '@nestjs/common';
import { LeavesService } from './leaves.service';
import { CreateLeaveDto, UpdateLeaveStatusDto } from './dto/hr.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '@repo/db';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';

@ApiTags('HR - Leaves')
@ApiBearerAuth()
@ApiHeader({ name: 'x-tenant-id', required: true, description: 'Tenant ID' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('hr/leaves')
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  @Post(':employeeId')
  @Roles(Role.ADMIN, Role.HR, Role.MANAGER, Role.EMPLOYEE)
  @ApiOperation({ summary: 'Submit a leave request for an employee' })
  create(
    @Headers('x-tenant-id') tenantId: string,
    @Param('employeeId') employeeId: string,
    @Body() dto: CreateLeaveDto,
  ) {
    return this.leavesService.createLeave(tenantId, employeeId, dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.HR, Role.MANAGER)
  @ApiOperation({ summary: 'Get all leave requests' })
  findAll(@Headers('x-tenant-id') tenantId: string) {
    return this.leavesService.findAll(tenantId, {
      include: { employee: true },
    });
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.HR, Role.MANAGER)
  @ApiOperation({ summary: 'Approve or reject a leave request' })
  updateStatus(
    @Request() req: any,
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateLeaveStatusDto,
  ) {
    return this.leavesService.updateLeaveStatus(tenantId, id, dto, req.user.id);
  }
}
