import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AnalyticsService } from '../services/analytics.service';
import { ForecastingService } from '../services/forecasting.service';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('AI Analytics & Forecasting')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly forecastingService: ForecastingService,
  ) {}

  @Get('dashboard/overview')
  @ApiOperation({ summary: 'Get overview stats for the main dashboard' })
  getOverview(@Request() req: any) {
    return this.analyticsService.getDashboardOverview(req.user.tenantId);
  }

  @Get('dashboard-summary')
  @ApiOperation({ summary: 'Get main dashboard overview values' })
  getSummary(@Request() req: any) {
    return this.analyticsService.getDashboardSummary(req.user.tenantId);
  }

  @Get('finance-charts')
  @ApiOperation({ summary: 'Get monthly financial analytics metrics' })
  getFinanceCharts(@Request() req: any) {
    return this.analyticsService.getFinanceCharts(req.user.tenantId);
  }

  @Get('hr-charts')
  @ApiOperation({ summary: 'Get employee metrics and leave stats' })
  getHRCharts(@Request() req: any) {
    return this.analyticsService.getHRCharts(req.user.tenantId);
  }

  @Get('inventory-charts')
  @ApiOperation({ summary: 'Get stock movement and product distribution levels' })
  getInventoryCharts(@Request() req: any) {
    return this.analyticsService.getInventoryCharts(req.user.tenantId);
  }

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
