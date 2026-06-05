import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CrudService } from '../../common/services/crud.service';
import { Transaction } from '@repo/db';

@Injectable()
export class TransactionsService extends CrudService<Transaction> {
  constructor(prisma: PrismaService) {
    super(prisma.transaction, false);
  }
}
