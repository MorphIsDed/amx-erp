import { Field, ObjectType, ID, Float } from '@nestjs/graphql';

@ObjectType()
export class ProjectModel {
  @Field(() => ID)
  id: string;

  @Field()
  tenantId: string;

  @Field()
  projectCode: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  status: string;

  @Field()
  startDate: Date;

  @Field()
  endDate: Date;

  @Field(() => Float)
  plannedBudget: number;

  @Field(() => Float)
  actualBudget: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
