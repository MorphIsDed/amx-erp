import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HrModule } from './modules/hr/hr.module';
import { TenantsModule } from './modules/tenant/tenant.module';
import { FinanceModule } from './modules/finance/finance.module';

import { EventEmitterModule } from '@nestjs/event-emitter';
import { ActivityModule } from './common/activity/activity.module';
import { JobsModule } from './common/jobs/jobs.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { InventoryModule } from './modules/inventory/inventory.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    HrModule,
    TenantsModule,
    FinanceModule,
    ActivityModule,
    JobsModule,
    NotificationsModule,
    InventoryModule,
  ],
})
export class AppModule {}
