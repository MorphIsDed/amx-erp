import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { TenantsService } from './tenant.service';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '@repo/db';

@ApiTags('Tenants')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new tenant and its admin user' })
  register(@Body() registerTenantDto: RegisterTenantDto) {
    return this.tenantsService.register(registerTenantDto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all tenants (System Admin only)' })
  findAll() {
    return this.tenantsService.findAll();
  }
}
