import { Resolver, Query, Args, Int, ResolveField, Parent, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { EmployeeModel } from '../models/employee.model';
import { EmployeesService } from '../../modules/hr/employees.service';

@ObjectType()
class DepartmentModel {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;
}

import { Field, ObjectType } from '@nestjs/graphql';

@Resolver(() => EmployeeModel)
@UseGuards(GqlAuthGuard)
export class EmployeesResolver {
  constructor(private readonly employeesService: EmployeesService) {}

  @Query(() => [EmployeeModel])
  async employees(
    @CurrentUser() user: any,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('search', { nullable: true }) search?: string,
  ) {
    return this.employeesService.findAll(user.tenantId, { skip, take, search });
  }

  @Query(() => EmployeeModel)
  async employee(@CurrentUser() user: any, @Args('id') id: string) {
    return this.employeesService.findOne(user.tenantId, id);
  }

  @ResolveField(() => DepartmentModel, { nullable: true })
  async department(
    @Parent() employee: EmployeeModel,
    @Context() ctx: any,
  ) {
    if (!employee.departmentId) return null;
    return ctx.loaders.departmentLoader.load(employee.departmentId);
  }
}
