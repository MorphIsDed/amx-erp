import {
  Resolver,
  Query,
  Args,
  Int,
  ResolveField,
  Parent,
  Context,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { ProjectModel } from '../models/project.model';
import { ProjectsService } from '../../modules/projects/projects.service';
import { EmployeeModel } from '../models/employee.model';

@Resolver(() => ProjectModel)
@UseGuards(GqlAuthGuard)
export class ProjectsResolver {
  constructor(private readonly projectsService: ProjectsService) {}

  @Query(() => [ProjectModel])
  async projects(
    @CurrentUser() user: any,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('search', { nullable: true }) search?: string,
  ) {
    return this.projectsService.findAll(user.tenantId, { skip, take, search });
  }

  @Query(() => ProjectModel)
  async project(@CurrentUser() user: any, @Args('id') id: string) {
    return this.projectsService.findOne(user.tenantId, id);
  }

  @ResolveField(() => [EmployeeModel])
  async members(@Parent() project: ProjectModel, @Context() ctx: any) {
    const resources = await this.projectsService.getProjectResources(
      project.tenantId,
      project.id,
    );
    return Promise.all(
      resources.map((res) => ctx.loaders.employeeLoader.load(res.employeeId)),
    );
  }
}
