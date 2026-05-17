import { Module } from '@nestjs/common';
import { PayrollController } from './payroll.controller';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { PayrollService } from './payroll.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { BullModule } from '@nestjs/bullmq';
import { PayrollProcessor } from './processors/payroll.processor';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'payroll',
    }),
  ],
  controllers: [EmployeesController, PayrollController],
  providers: [EmployeesService, PayrollService, PayrollProcessor],
  exports: [EmployeesService, PayrollService],
})
export class HrModule {}
