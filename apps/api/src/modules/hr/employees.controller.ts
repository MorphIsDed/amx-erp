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
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '@repo/db';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('HR - Employees')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('hr/employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.HR)
  @ApiOperation({ summary: 'Create a new employee' })
  create(@Request() req: any, @Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(req.user.tenantId, createEmployeeDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.HR, Role.MANAGER)
  @ApiOperation({ summary: 'Get all employees' })
  findAll(
    @Request() req: any,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('search') search?: string,
    @Query('departmentId') departmentId?: string,
    @Query('status') status?: string,
  ) {
    return this.employeesService.findAll(req.user.tenantId, {
      skip,
      take,
      search,
      departmentId,
      status,
    });
  }

  @Get('departments')
  @Roles(Role.ADMIN, Role.HR, Role.MANAGER)
  @ApiOperation({ summary: 'Get all departments' })
  findDepartments(@Request() req: any) {
    return this.employeesService.findDepartments(req.user.tenantId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.HR, Role.MANAGER)
  @ApiOperation({ summary: 'Get an employee by ID' })
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.employeesService.findOne(req.user.tenantId, id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.HR)
  @ApiOperation({ summary: 'Update an employee' })
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(
      req.user.tenantId,
      id,
      updateEmployeeDto,
    );
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.HR)
  @ApiOperation({ summary: 'Delete an employee' })
  remove(@Request() req: any, @Param('id') id: string) {
    return this.employeesService.remove(req.user.tenantId, id);
  }
}
