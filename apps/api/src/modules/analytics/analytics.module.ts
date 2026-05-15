import { Module } from '@nestjs/common';
import { ForecastingService } from './services/forecasting.service';
import { AnalyticsController } from './controllers/analytics.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AnalyticsController],
  providers: [ForecastingService],
  exports: [ForecastingService],
})
export class AnalyticsModule {}
