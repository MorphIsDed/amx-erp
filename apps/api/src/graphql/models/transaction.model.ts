import { Field, ObjectType, ID, Float } from '@nestjs/graphql';

@ObjectType()
export class TransactionModel {
  @Field(() => ID)
  id: string;

  @Field()
  date: Date;

  @Field()
  description: string;

  @Field(() => Float)
  amount: number;

  @Field()
  type: string;

  @Field()
  category: string;

  @Field()
  tenantId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
