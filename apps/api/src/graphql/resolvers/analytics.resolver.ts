import { Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { ForecastModel, InventoryInsightModel, SKUForecastModel } from '../models/analytics.model';
import { ForecastingService } from '../../modules/analytics/services/forecasting.service';

@Resolver()
@UseGuards(GqlAuthGuard)
export class AnalyticsResolver {
  constructor(private readonly forecastingService: ForecastingService) {}

  @Query(() => [ForecastModel])
  async revenueForecast(@CurrentUser() user: any) {
    return this.forecastingService.getRevenueForecast(user.tenantId);
  }

  @Query(() => [InventoryInsightModel])
  async inventoryInsights(@CurrentUser() user: any) {
    return this.forecastingService.getInventoryForecast(user.tenantId);
  }

  @Query(() => SKUForecastModel)
  async skuForecast(
    @CurrentUser() user: any,
    @Args('skuOrId') skuOrId: string,
  ) {
    return this.forecastingService.getSkuForecast(user.tenantId, skuOrId);
  }
}
