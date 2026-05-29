import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PayrollService } from '../payroll.service';

@Processor('payroll')
export class PayrollProcessor extends WorkerHost {
  constructor(private readonly payrollService: PayrollService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { tenantId, payrollRunId } = job.data;

    console.log(
      `Processing payroll run ${payrollRunId} for tenant ${tenantId}...`,
    );

    // In a real scenario, this would do heavy calculations or PDF generation
    await this.payrollService.finalizePayroll(tenantId, payrollRunId);

    console.log(`Payroll run ${payrollRunId} completed.`);
    return { success: true };
  }
}
