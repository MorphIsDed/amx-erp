import {
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { ForecastingService } from '../services/forecasting.service';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('AI Demand Forecasting')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('forecasting')
export class ForecastingController {
  constructor(private readonly forecastingService: ForecastingService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get global demand forecasting summary stats' })
  getSummary(@Request() req: any) {
    return this.forecastingService.getSummary(req.user.tenantId);
  }

  @Get('sku/:id')
  @ApiOperation({
    summary: 'Get 30, 60, and 90-day demand forecast for a specific SKU',
  })
  getSkuForecast(@Param('id') id: string, @Request() req: any) {
    return this.forecastingService.getSkuForecast(req.user.tenantId, id);
  }

  @Get('top-demand')
  @ApiOperation({
    summary: 'Get top products with highest forecasted demand in next 30 days',
  })
  getTopDemand(@Request() req: any) {
    return this.forecastingService.getTopDemand(req.user.tenantId);
  }

  @Post('train')
  @ApiOperation({
    summary: 'Trigger model retraining for all active products in the tenant',
  })
  async triggerTraining(@Request() req: any) {
    return this.forecastingService.retrainAllModels(req.user.tenantId);
  }
}
