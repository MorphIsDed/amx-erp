import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CrudService } from '../../common/services/crud.service';
import { Account } from '@repo/db';
import { CreateAccountDto } from './dto/finance.dto';

@Injectable()
export class AccountsService extends CrudService<Account> {
  constructor(private prisma: PrismaService) {
    super(prisma.account, false);
  }

  async createAccount(
    tenantId: string,
    dto: CreateAccountDto,
  ): Promise<Account> {
    const existing = await this.prisma.account.findFirst({
      where: { tenantId, code: dto.code },
    });
    if (existing) {
      throw new ConflictException(
        `Account with code ${dto.code} already exists for this tenant.`,
      );
    }

    return this.prisma.account.create({
      data: {
        code: dto.code,
        name: dto.name,
        type: dto.type,
        balance: dto.balance || 0.0,
        tenantId,
      },
    });
  }

  async deleteAccount(tenantId: string, id: string): Promise<void> {
    const account = await this.prisma.account.findFirst({
      where: { id, tenantId },
      include: {
        _count: {
          select: { journalLines: true },
        },
      },
    });

    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found.`);
    }

    if (account._count.journalLines > 0) {
      throw new ConflictException(
        `Cannot delete account ${account.code} because it has existing transactions.`,
      );
    }

    await this.prisma.account.delete({
      where: { id },
    });
  }
}
