import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
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
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { IdempotencyModule } from './common/idempotency/idempotency.module';
import { AppGraphQLModule } from './graphql/graphql.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 100, // max 100 requests per IP per minute
    }]),
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
    IdempotencyModule,
    JobsModule,
    NotificationsModule,
    InventoryModule,
    AnalyticsModule,
    AppGraphQLModule,
    ProjectsModule,
    WebhooksModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
