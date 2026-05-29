import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CrudService } from '../../common/services/crud.service';
import { JournalEntry, JournalEntryStatus, AccountingPeriodStatus, AccountType } from '@repo/db';
import { CreateJournalEntryDto } from './dto/finance.dto';

@Injectable()
export class JournalEntriesService extends CrudService<JournalEntry> {
  constructor(private prisma: PrismaService) {
    super(prisma.journalEntry);
  }

  async validateJournalEntry(dto: CreateJournalEntryDto): Promise<void> {
    let totalDebit = 0;
    let totalCredit = 0;

    for (const line of dto.lines) {
      totalDebit += line.debit || 0;
      totalCredit += line.credit || 0;
    }

    // Debits must equal credits with basic floating-point tolerance
    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      throw new BadRequestException(
        `Unbalanced Journal Entry. Total debits (${totalDebit}) must equal total credits (${totalCredit}).`,
      );
    }
  }

  async createEntry(
    tenantId: string,
    dto: CreateJournalEntryDto,
    adminOverride = false,
  ): Promise<JournalEntry> {
    // 1. Verify period is open
    const period = await this.prisma.accountingPeriod.findFirst({
      where: { id: dto.periodId, tenantId },
    });

    if (!period) {
      throw new NotFoundException('Accounting period not found.');
    }

    if (period.status === AccountingPeriodStatus.CLOSED && !adminOverride) {
      throw new BadRequestException('Cannot post to a closed accounting period without administrative override.');
    }

    // 2. Validate debits equal credits
    await this.validateJournalEntry(dto);

    // 3. Post transaction inside $transaction
    return this.prisma.$transaction(async (tx) => {
      // Create parent journal entry
      const entry = await tx.journalEntry.create({
        data: {
          date: new Date(dto.date),
          description: dto.description,
          status: JournalEntryStatus.POSTED,
          periodId: dto.periodId,
          tenantId,
          lines: {
            create: dto.lines.map((l) => ({
              accountId: l.accountId,
              debit: l.debit || 0.0,
              credit: l.credit || 0.0,
            })),
          },
        },
        include: {
          lines: {
            include: { account: true },
          },
        },
      });

      // Update account balances
      for (const line of entry.lines) {
        const account = await tx.account.findUnique({
          where: { id: line.accountId },
        });

        if (!account || account.tenantId !== tenantId) {
          throw new NotFoundException(`Account ${line.accountId} not found or unauthorized.`);
        }

        let newBalance = account.balance;

        if (
          account.type === AccountType.ASSET ||
          account.type === AccountType.EXPENSE
        ) {
          newBalance += line.debit - line.credit;
        } else {
          newBalance += line.credit - line.debit;
        }

        await tx.account.update({
          where: { id: account.id },
          data: { balance: newBalance },
        });
      }

      return entry;
    });
  }
}
