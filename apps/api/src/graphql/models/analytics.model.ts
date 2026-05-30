import { Field, ObjectType, Float } from '@nestjs/graphql';

@ObjectType()
export class ForecastModel {
  @Field()
  month: string;

  @Field(() => Float, { nullable: true })
  actual?: number;

  @Field(() => Float)
  predicted: number;
}

@ObjectType()
export class InventoryInsightModel {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  sku: string;

  @Field(() => Float)
  dailyBurnRate: number;

  @Field(() => Float)
  daysRemaining: number;

  @Field()
  riskLevel: string;
}

@ObjectType()
export class PredictionPointModel {
  @Field()
  date: string;

  @Field(() => Float)
  quantity: number;
}

@ObjectType()
export class SKUForecastModel {
  @Field()
  sku: string;

  @Field()
  productName: string;

  @Field()
  forecastType: string;

  @Field(() => Float)
  horizon: number;

  @Field(() => [PredictionPointModel])
  predictions: PredictionPointModel[];
}
