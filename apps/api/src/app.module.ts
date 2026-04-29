import { Module } from '@nestjs/common';

import { AuthModule } from './modules/auth/auth.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { FinanceModule } from './modules/finance/finance.module';
import { HrModule } from './modules/hr/hr.module';
import { SupplyChainModule } from './modules/supply-chain/supply-chain.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuditModule } from './modules/audit/audit.module';

@Module({
  imports: [
    AuthModule,
    TenantModule,
    FinanceModule,
    HrModule,
    SupplyChainModule,
    ProjectsModule,
    NotificationsModule,
    AuditModule,
  ],
})
export class AppModule {}