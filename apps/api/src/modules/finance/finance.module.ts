import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { JournalEntriesService } from './journal-entries.service';
import { JournalEntriesController } from './journal-entries.controller';
import { PeriodsService } from './periods.service';
import { PeriodsController } from './periods.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { InvoiceOCRService } from './invoice-ocr.service';
import { ThreeWayMatchingService } from './three-way-matching.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    InvoicesController,
    TransactionsController,
    AccountsController,
    JournalEntriesController,
    PeriodsController,
  ],
  providers: [
    InvoicesService,
    TransactionsService,
    AccountsService,
    JournalEntriesService,
    PeriodsService,
    InvoiceOCRService,
    ThreeWayMatchingService,
  ],
  exports: [
    InvoicesService,
    TransactionsService,
    AccountsService,
    JournalEntriesService,
    PeriodsService,
    InvoiceOCRService,
    ThreeWayMatchingService,
  ],
})
export class FinanceModule {}
