import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PayrollStatus, PayslipStatus } from '@repo/db';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class PayrollService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
    @InjectQueue('payroll') private payrollQueue: Queue
  ) {}

  async createPayrollRun(tenantId: string, data: { periodStart: Date; periodEnd: Date }) {
    const employees = await this.prisma.employee.findMany({
      where: { tenantId, status: 'ACTIVE' }
    });

    if (employees.length === 0) throw new ConflictException('No active employees found for payroll');

    // Create the Run
    const payrollRun = await this.prisma.payrollRun.create({
      data: {
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
        status: PayrollStatus.DRAFT,
        totalAmount: 0, // Will update after calculating payslips
        tenantId
      }
    });

    // Create individual payslips (Mocking salary logic for now)
    let totalRunAmount = 0;
    const payslips = await Promise.all(employees.map(async (emp) => {
      const basicSalary = 50000; // In a real app, this would come from the Employee contract
      const allowances = 5000;
      const deductions = 2000;
      const netSalary = basicSalary + allowances - deductions;
      totalRunAmount += netSalary;

      return this.prisma.payslip.create({
        data: {
          employeeId: emp.id,
          payrollRunId: payrollRun.id,
          basicSalary,
          allowances,
          deductions,
          netSalary,
          status: PayslipStatus.PENDING,
          tenantId
        }
      });
    }));

    // Update total amount in run
    const updatedRun = await this.prisma.payrollRun.update({
      where: { id: payrollRun.id },
      data: { totalAmount: totalRunAmount },
      include: { payslips: { include: { employee: true } } }
    });

    this.eventEmitter.emit('payroll.run.created', updatedRun);
    return updatedRun;
  }

  async getPayrollRuns(tenantId: string) {
    return this.prisma.payrollRun.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { payslips: true } } }
    });
  }

  async getPayrollDetails(tenantId: string, id: string) {
    const run = await this.prisma.payrollRun.findUnique({
      where: { id, tenantId },
      include: { 
        payslips: { 
          include: { employee: true } 
        } 
      }
    });
    if (!run) throw new NotFoundException('Payroll run not found');
    return run;
  }

  async processPayroll(tenantId: string, id: string) {
    const run = await this.prisma.payrollRun.findUnique({
      where: { id, tenantId }
    });
    if (!run) throw new NotFoundException('Payroll run not found');

    // Update status to PROCESSING
    await this.prisma.payrollRun.update({
      where: { id },
      data: { status: PayrollStatus.PROCESSING }
    });

    // Add to background queue
    await this.payrollQueue.add('process', {
      tenantId,
      payrollRunId: id
    });

    return { status: 'QUEUED', message: 'Payroll processing started in background' };
  }

  async finalizePayroll(tenantId: string, id: string) {
    const run = await this.prisma.payrollRun.update({
      where: { id },
      data: { status: PayrollStatus.COMPLETED },
      include: { payslips: true }
    });

    // Update all payslips to PAID
    await this.prisma.payslip.updateMany({
      where: { payrollRunId: id },
      data: { status: PayslipStatus.PAID, paidAt: new Date() }
    });

    this.eventEmitter.emit('payroll.run.completed', run);
    return run;
  }
}
