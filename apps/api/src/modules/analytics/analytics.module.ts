import { Module } from '@nestjs/common';
import { AnalyticsService } from './services/analytics.service';
import { ForecastingService } from './services/forecasting.service';
import { AnalyticsController } from './controllers/analytics.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, ForecastingService],
  exports: [AnalyticsService, ForecastingService],
})
export class AnalyticsModule {}
