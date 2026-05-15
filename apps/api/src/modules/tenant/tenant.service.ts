import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import * as bcrypt from 'bcrypt';
import { Role } from '@repo/db';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async register(dto: RegisterTenantDto) {
    // Check if domain or email exists
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { domain: dto.companyDomain },
    });
    if (existingTenant) {
      throw new ConflictException('Company domain already exists');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.adminEmail },
    });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.adminPassword, 10);

    return this.prisma.$transaction(async (tx) => {
      // 1. Create Tenant
      const tenant = await tx.tenant.create({
        data: {
          name: dto.companyName,
          domain: dto.companyDomain,
        },
      });

      // 2. Create Admin User
      const user = await tx.user.create({
        data: {
          email: dto.adminEmail,
          password: hashedPassword,
          name: dto.adminName,
          role: Role.ADMIN,
          tenantId: tenant.id,
        },
      });

      return {
        tenantId: tenant.id,
        adminId: user.id,
        message: 'Tenant and Admin created successfully',
      };
    });
  }

  async findByDomain(domain: string) {
    return this.prisma.tenant.findUnique({ where: { domain } });
  }

  async findAll() {
    return this.prisma.tenant.findMany();
  }
}
