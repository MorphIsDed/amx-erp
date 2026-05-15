import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ForecastingService } from '../services/forecasting.service';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('AI Analytics & Forecasting')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly forecastingService: ForecastingService) {}

  @Get('revenue-forecast')
  @ApiOperation({ summary: 'Get AI-powered revenue predictions' })
  getRevenueForecast(@Request() req: any) {
    return this.forecastingService.getRevenueForecast(req.user.tenantId);
  }

  @Get('inventory-insights')
  @ApiOperation({ summary: 'Get AI-powered inventory replenishment insights' })
  getInventoryInsights(@Request() req: any) {
    return this.forecastingService.getInventoryForecast(req.user.tenantId);
  }
}
