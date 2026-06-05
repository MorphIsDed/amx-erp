import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CrudService } from '../../common/services/crud.service';
import { AccountingPeriod, AccountingPeriodStatus } from '@repo/db';
import { CreatePeriodDto } from './dto/finance.dto';

@Injectable()
export class PeriodsService extends CrudService<AccountingPeriod> {
  constructor(private prisma: PrismaService) {
    super(prisma.accountingPeriod, false);
  }

  async createPeriod(
    tenantId: string,
    dto: CreatePeriodDto,
  ): Promise<AccountingPeriod> {
    return this.prisma.accountingPeriod.create({
      data: {
        name: dto.name,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        status: AccountingPeriodStatus.OPEN,
        tenantId,
      },
    });
  }

  async closePeriod(tenantId: string, id: string): Promise<AccountingPeriod> {
    const period = await this.prisma.accountingPeriod.findFirst({
      where: { id, tenantId },
    });
    if (!period) throw new NotFoundException('Accounting period not found');

    return this.prisma.accountingPeriod.update({
      where: { id },
      data: { status: AccountingPeriodStatus.CLOSED },
    });
  }
}
