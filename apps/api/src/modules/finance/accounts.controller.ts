import { Controller, Get, Post, Body, Param, Delete, Headers } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/finance.dto';
import { ApiTags, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';

@ApiTags('Finance - Accounts')
@ApiBearerAuth()
@ApiHeader({ name: 'x-tenant-id', required: true, description: 'Tenant ID' })
@Controller('finance/accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  create(@Headers('x-tenant-id') tenantId: string, @Body() dto: CreateAccountDto) {
    return this.accountsService.createAccount(tenantId, dto);
  }

  @Get()
  findAll(@Headers('x-tenant-id') tenantId: string) {
    return this.accountsService.findAll(tenantId, {});
  }

  @Get(':id')
  findOne(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    return this.accountsService.findOne(tenantId, id);
  }

  @Delete(':id')
  remove(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    return this.accountsService.deleteAccount(tenantId, id);
  }
}
