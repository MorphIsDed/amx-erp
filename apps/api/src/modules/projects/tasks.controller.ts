import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import {
  CreateTaskDto,
  UpdateTaskDto,
  CreateTaskDependencyDto,
} from './dto/project.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role, TaskStatus } from '@repo/db';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Project Management - Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER, Role.EMPLOYEE)
  @ApiOperation({ summary: 'Create a new task' })
  async create(@Request() req: any, @Body() createTaskDto: CreateTaskDto) {
    const result = await this.tasksService.create(
      req.user.tenantId,
      createTaskDto,
    );
    return { data: result };
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.HR, Role.FINANCE, Role.EMPLOYEE)
  @ApiOperation({ summary: 'Get all tasks with pagination/filtering' })
  async findAll(
    @Request() req: any,
    @Query('projectId') projectId?: string,
    @Query('milestoneId') milestoneId?: string,
    @Query('assignedEmployeeId') assignedEmployeeId?: string,
    @Query('status') status?: TaskStatus,
    @Query('search') search?: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    const result = await this.tasksService.findAll(req.user.tenantId, {
      projectId,
      milestoneId,
      assignedEmployeeId,
      status,
      search,
      skip,
      take,
    });
    return { data: result };
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.HR, Role.FINANCE, Role.EMPLOYEE)
  @ApiOperation({ summary: 'Get a task by ID' })
  async findOne(@Request() req: any, @Param('id') id: string) {
    const result = await this.tasksService.findOne(req.user.tenantId, id);
    return { data: result };
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.EMPLOYEE)
  @ApiOperation({ summary: 'Update a task' })
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    const result = await this.tasksService.update(
      req.user.tenantId,
      id,
      updateTaskDto,
    );
    return { data: result };
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Delete a task' })
  remove(@Request() req: any, @Param('id') id: string) {
    return this.tasksService.remove(req.user.tenantId, id);
  }

  // --- Task Dependencies Endpoints ---
  @Post('dependencies')
  @Roles(Role.ADMIN, Role.MANAGER, Role.EMPLOYEE)
  @ApiOperation({ summary: 'Create a task dependency with circular checking' })
  async addDependency(
    @Request() req: any,
    @Body() dto: CreateTaskDependencyDto,
  ) {
    const result = await this.tasksService.addDependency(
      req.user.tenantId,
      dto,
    );
    return { data: result };
  }

  @Delete('dependencies/:predecessorTaskId/:successorTaskId')
  @Roles(Role.ADMIN, Role.MANAGER, Role.EMPLOYEE)
  @ApiOperation({ summary: 'Remove a task dependency' })
  removeDependency(
    @Request() req: any,
    @Param('predecessorTaskId') predecessorTaskId: string,
    @Param('successorTaskId') successorTaskId: string,
  ) {
    return this.tasksService.removeDependency(
      req.user.tenantId,
      predecessorTaskId,
      successorTaskId,
    );
  }
}
