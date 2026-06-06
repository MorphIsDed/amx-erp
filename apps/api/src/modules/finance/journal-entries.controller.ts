import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JournalEntriesService } from './journal-entries.service';
import { CreateJournalEntryDto } from './dto/finance.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '@repo/db';

@ApiTags('Finance - Journal Entries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('finance/journal-entries')
export class JournalEntriesController {
  constructor(private readonly journalEntriesService: JournalEntriesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.FINANCE)
  @ApiOperation({ summary: 'Create a new journal entry' })
  create(
    @Request() req: any,
    @Body() dto: CreateJournalEntryDto,
    @Query('override') override?: string,
  ) {
    const adminOverride = override === 'true';
    return this.journalEntriesService.createEntry(
      req.user.tenantId,
      dto,
      adminOverride,
    );
  }

  @Get()
  @Roles(Role.ADMIN, Role.FINANCE, Role.MANAGER)
  @ApiOperation({ summary: 'Get all journal entries' })
  findAll(@Request() req: any) {
    return this.journalEntriesService.findAll(req.user.tenantId, {
      include: {
        lines: { include: { account: true } },
      },
    });
  }
}
