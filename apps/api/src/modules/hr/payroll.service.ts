import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
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
    @InjectQueue('payroll') private payrollQueue: Queue,
  ) {}

  async createPayrollRun(
    tenantId: string,
    data: { periodStart: Date; periodEnd: Date },
  ) {
    const periodStart = new Date(data.periodStart);
    const periodEnd = new Date(data.periodEnd);

    const employees = await this.prisma.employee.findMany({
      where: { tenantId, status: 'ACTIVE' },
    });

    if (employees.length === 0)
      throw new ConflictException('No active employees found for payroll');

    // Create the Run
    const payrollRun = await this.prisma.payrollRun.create({
      data: {
        periodStart,
        periodEnd,
        status: PayrollStatus.DRAFT,
        totalAmount: 0, // Will update after calculating payslips
        tenantId,
      },
    });

    let totalRunAmount = 0;
    const _payslips = await Promise.all(
      employees.map(async (emp) => {
        const basicSalary = emp.baseSalary || 50000;
        const allowances = emp.allowances || 0;
        const deductions = emp.deductions || 0;

        // Calculate unpaid leave days falling within this period
        const unpaidLeaves = await this.prisma.leave.findMany({
          where: {
            employeeId: emp.id,
            tenantId,
            type: 'UNPAID',
            status: 'APPROVED',
            startDate: { lte: periodEnd },
            endDate: { gte: periodStart },
          },
        });

        let leaveDays = 0;
        unpaidLeaves.forEach((leave) => {
          const start = Math.max(
            new Date(leave.startDate).getTime(),
            periodStart.getTime(),
          );
          const end = Math.min(
            new Date(leave.endDate).getTime(),
            periodEnd.getTime(),
          );
          const diffTime = Math.max(0, end - start);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive
          leaveDays += diffDays;
        });

        const leavePenalty = Math.round((basicSalary / 30) * leaveDays);
        const grossSalary = basicSalary + allowances;

        // Tax Engine (Slabs: >100k: 20%, >50k: 10%, else 5%)
        const tax =
          grossSalary > 100000
            ? Math.round(grossSalary * 0.2)
            : grossSalary > 50000
              ? Math.round(grossSalary * 0.1)
              : Math.round(grossSalary * 0.05);

        const netSalary = Math.max(
          0,
          grossSalary - tax - deductions - leavePenalty,
        );
        totalRunAmount += netSalary;

        return this.prisma.payslip.create({
          data: {
            employeeId: emp.id,
            payrollRunId: payrollRun.id,
            basicSalary,
            allowances,
            deductions: deductions + tax + leavePenalty, // aggregate total deductions including tax/penalty
            netSalary,
            status: PayslipStatus.PENDING,
            tenantId,
          },
        });
      }),
    );

    // Update total amount in run
    const updatedRun = await this.prisma.payrollRun.update({
      where: { id: payrollRun.id },
      data: { totalAmount: totalRunAmount },
      include: { payslips: { include: { employee: true } } },
    });

    this.eventEmitter.emit('payroll.run.created', updatedRun);
    return updatedRun;
  }

  async getPayrollRuns(tenantId: string) {
    return this.prisma.payrollRun.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { payslips: true } } },
    });
  }

  async getPayrollDetails(tenantId: string, id: string) {
    const run = await this.prisma.payrollRun.findUnique({
      where: { id, tenantId },
      include: {
        payslips: {
          include: { employee: true },
        },
      },
    });
    if (!run) throw new NotFoundException('Payroll run not found');
    return run;
  }

  async processPayroll(tenantId: string, id: string) {
    const run = await this.prisma.payrollRun.findUnique({
      where: { id, tenantId },
    });
    if (!run) throw new NotFoundException('Payroll run not found');

    // Update status to PROCESSING
    await this.prisma.payrollRun.update({
      where: { id },
      data: { status: PayrollStatus.PROCESSING },
    });

    // Add to background queue
    await this.payrollQueue.add('process', {
      tenantId,
      payrollRunId: id,
    });

    return {
      status: 'QUEUED',
      message: 'Payroll processing started in background',
    };
  }

  async finalizePayroll(tenantId: string, id: string) {
    const existing = await this.prisma.payrollRun.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      throw new NotFoundException('Payroll run not found');
    }

    const run = await this.prisma.payrollRun.update({
      where: { id },
      data: { status: PayrollStatus.COMPLETED },
      include: { payslips: true },
    });

    // Update all payslips to PAID
    await this.prisma.payslip.updateMany({
      where: { payrollRunId: id, tenantId },
      data: { status: PayslipStatus.PAID, paidAt: new Date() },
    });

    this.eventEmitter.emit('payroll.run.completed', run);
    return run;
  }

  // --- KPIs ---
  async getMonthlyPayrollCost(tenantId: string) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const stats = await this.prisma.payrollRun.findMany({
      where: {
        tenantId,
        status: PayrollStatus.COMPLETED,
        createdAt: { gte: sixMonthsAgo },
      },
      select: {
        createdAt: true,
        totalAmount: true,
      },
    });

    return stats.map((run) => ({
      month: new Date(run.createdAt).toLocaleString('default', {
        month: 'short',
      }),
      cost: run.totalAmount,
    }));
  }

  async getDepartmentPayrollCost(tenantId: string) {
    const payslips = await this.prisma.payslip.findMany({
      where: {
        tenantId,
        status: PayslipStatus.PAID,
      },
      include: {
        employee: {
          include: { department: true },
        },
      },
    });

    const deptCosts: Record<string, number> = {};
    payslips.forEach((ps) => {
      const deptName = ps.employee.department?.name || 'Unassigned';
      deptCosts[deptName] = (deptCosts[deptName] || 0) + ps.netSalary;
    });

    return Object.keys(deptCosts).map((name) => ({
      department: name,
      cost: deptCosts[name],
    }));
  }

  async getEmployeePayrollHistory(tenantId: string, employeeId: string) {
    return this.prisma.payslip.findMany({
      where: {
        tenantId,
        employeeId,
        status: PayslipStatus.PAID,
      },
      orderBy: { createdAt: 'desc' },
      include: { payrollRun: true },
    });
  }
}
