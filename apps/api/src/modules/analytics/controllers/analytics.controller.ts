import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
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
  @ApiOperation({
    summary: 'Get stock movement and product distribution levels',
  })
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

  @Get('projects')
  @ApiOperation({ summary: 'Get projects overview metrics' })
  getProjectsAnalytics(@Request() req: any) {
    return this.analyticsService.getProjectsAnalytics(req.user.tenantId);
  }

  @Get('project-progress')
  @ApiOperation({ summary: 'Get progress analytics for all active projects' })
  getProjectProgress(@Request() req: any) {
    return this.analyticsService.getProjectProgressAnalytics(req.user.tenantId);
  }

  @Get('project-budget')
  @ApiOperation({ summary: 'Get budget analytics for all projects' })
  getProjectBudget(@Request() req: any) {
    return this.analyticsService.getProjectBudgetAnalytics(req.user.tenantId);
  }

  @Get('resource-utilization')
  @ApiOperation({
    summary: 'Get active resource allocation and utilization metrics',
  })
  getResourceUtilization(@Request() req: any) {
    return this.analyticsService.getResourceUtilizationAnalytics(
      req.user.tenantId,
    );
  }

  @Get('dashboard/layout')
  @ApiOperation({ summary: 'Get current user customized dashboard layout' })
  getDashboardLayout(@Request() req: any) {
    return this.analyticsService.getDashboardLayout(
      req.user.id,
      req.user.tenantId,
    );
  }

  @Post('dashboard/layout/save')
  @ApiOperation({ summary: 'Save customized dashboard layout' })
  saveDashboardLayout(@Request() req: any, @Body() body: { layout: any }) {
    return this.analyticsService.saveDashboardLayout(
      req.user.id,
      req.user.tenantId,
      body.layout,
    );
  }
}
