import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/finance.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '@repo/db';

@ApiTags('Finance - Accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('finance/accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.FINANCE)
  @ApiOperation({ summary: 'Create a new account' })
  create(@Request() req: any, @Body() dto: CreateAccountDto) {
    return this.accountsService.createAccount(req.user.tenantId, dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.FINANCE, Role.MANAGER)
  @ApiOperation({ summary: 'Get all accounts' })
  findAll(@Request() req: any) {
    return this.accountsService.findAll(req.user.tenantId, {});
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.FINANCE, Role.MANAGER)
  @ApiOperation({ summary: 'Get account by ID' })
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.accountsService.findOne(req.user.tenantId, id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.FINANCE)
  @ApiOperation({ summary: 'Delete account' })
  remove(@Request() req: any, @Param('id') id: string) {
    return this.accountsService.deleteAccount(req.user.tenantId, id);
  }
}
