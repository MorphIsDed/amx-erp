import { Field, ObjectType, ID } from '@nestjs/graphql';

@ObjectType()
export class EmployeeModel {
  @Field(() => ID)
  id: string;

  @Field()
  employeeId: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  phone?: string;

  @Field()
  status: string;

  @Field()
  hireDate: Date;

  @Field()
  tenantId: string;

  @Field({ nullable: true })
  departmentId?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
