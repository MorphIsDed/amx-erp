import { Controller, Get, Post, Body, Headers, Query } from '@nestjs/common';
import { JournalEntriesService } from './journal-entries.service';
import { CreateJournalEntryDto } from './dto/finance.dto';
import { ApiTags, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';

@ApiTags('Finance - Journal Entries')
@ApiBearerAuth()
@ApiHeader({ name: 'x-tenant-id', required: true, description: 'Tenant ID' })
@Controller('finance/journal-entries')
export class JournalEntriesController {
  constructor(private readonly journalEntriesService: JournalEntriesService) {}

  @Post()
  create(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreateJournalEntryDto,
    @Query('override') override?: string,
  ) {
    const adminOverride = override === 'true';
    return this.journalEntriesService.createEntry(tenantId, dto, adminOverride);
  }

  @Get()
  findAll(@Headers('x-tenant-id') tenantId: string) {
    return this.journalEntriesService.findAll(tenantId, {
      include: {
        lines: { include: { account: true } },
      },
    });
  }
}
