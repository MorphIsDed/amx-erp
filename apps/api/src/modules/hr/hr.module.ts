import { Module } from '@nestjs/common';
import { PayrollController } from './payroll.controller';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { PayrollService } from './payroll.service';
import { LeavesService } from './leaves.service';
import { LeavesController } from './leaves.controller';
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
  controllers: [EmployeesController, PayrollController, LeavesController],
  providers: [
    EmployeesService,
    PayrollService,
    LeavesService,
    PayrollProcessor,
  ],
  exports: [EmployeesService, PayrollService, LeavesService],
})
export class HrModule {}
