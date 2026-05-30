import { Field, ObjectType, ID, Float } from '@nestjs/graphql';

@ObjectType()
export class ProductModel {
  @Field(() => ID)
  id: string;

  @Field()
  sku: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  category?: string;

  @Field()
  unit: string;

  @Field(() => Float)
  price: number;

  @Field()
  tenantId: string;

  @Field(() => Float)
  reorderLevel: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
