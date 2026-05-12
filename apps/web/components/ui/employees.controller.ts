import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { EmployeeRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('hr/employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @Roles(EmployeeRole.ADMIN, EmployeeRole.HR)
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto);
  }

  @Get()
  @Roles(EmployeeRole.ADMIN, EmployeeRole.HR, EmployeeRole.MANAGER)
  findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('search') search?: string,
    @Query('departmentId') departmentId?: string,
    @Query('status') status?: string,
  ) {
    return this.employeesService.findAll({ skip, take, search, departmentId, status });
  }

  @Patch(':id')
  @Roles(EmployeeRole.ADMIN, EmployeeRole.HR)
  update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  @Roles(EmployeeRole.ADMIN, EmployeeRole.HR)
  remove(@Param('id') id: string) {
    return this.employeesService.remove(id);
  }
}