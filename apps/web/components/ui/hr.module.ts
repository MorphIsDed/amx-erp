import { Module } from '@nestjs/common';
import { EmployeesService } from './employees/employees.service';
import { EmployeesController } from './employees/employees.controller';

@Module({
  controllers: [EmployeesController],
  providers: [EmployeesService],
})
export class HrModule {}