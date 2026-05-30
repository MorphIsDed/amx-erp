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
import { ProjectsService } from './projects.service';
import {
  CreateProjectDto,
  UpdateProjectDto,
  AddProjectMemberDto,
  UpdateProjectMemberDto,
} from './dto/project.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role, ProjectStatus } from '@repo/db';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Project Management - Projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Create a new project' })
  async create(@Request() req: any, @Body() createProjectDto: CreateProjectDto) {
    const result = await this.projectsService.create(req.user.tenantId, createProjectDto);
    return { data: result };
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.HR, Role.FINANCE, Role.EMPLOYEE)
  @ApiOperation({ summary: 'Get all projects with pagination/filtering' })
  async findAll(
    @Request() req: any,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('search') search?: string,
    @Query('status') status?: ProjectStatus,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const result = await this.projectsService.findAll(req.user.tenantId, {
      skip,
      take,
      search,
      status,
      sortBy,
      sortOrder,
    });
    return { data: result };
  }

  @Get('employee-allocation/:employeeId')
  @Roles(Role.ADMIN, Role.MANAGER, Role.HR)
  @ApiOperation({ summary: 'Get an employee\'s active project allocations' })
  async getEmployeeAllocation(@Request() req: any, @Param('employeeId') employeeId: string) {
    const result = await this.projectsService.getEmployeeAllocation(req.user.tenantId, employeeId);
    return { data: result };
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.HR, Role.FINANCE, Role.EMPLOYEE)
  @ApiOperation({ summary: 'Get a project by ID' })
  async findOne(@Request() req: any, @Param('id') id: string) {
    const result = await this.projectsService.findOne(req.user.tenantId, id);
    return { data: result };
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Update a project' })
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    const result = await this.projectsService.update(req.user.tenantId, id, updateProjectDto);
    return { data: result };
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Soft delete a project' })
  remove(@Request() req: any, @Param('id') id: string) {
    return this.projectsService.remove(req.user.tenantId, id);
  }

  // --- Resource Allocation Endpoints ---
  @Get(':id/resources')
  @Roles(Role.ADMIN, Role.MANAGER, Role.HR)
  @ApiOperation({ summary: 'Get project resources' })
  async getResources(@Request() req: any, @Param('id') id: string) {
    const result = await this.projectsService.getProjectResources(req.user.tenantId, id);
    return { data: result };
  }

  @Post(':id/resources')
  @Roles(Role.ADMIN, Role.MANAGER, Role.HR)
  @ApiOperation({ summary: 'Allocate a member to a project' })
  async addResource(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: AddProjectMemberDto,
  ) {
    const result = await this.projectsService.addMember(req.user.tenantId, id, dto);
    return { data: result };
  }

  @Put(':id/resources/:employeeId')
  @Roles(Role.ADMIN, Role.MANAGER, Role.HR)
  @ApiOperation({ summary: 'Update a member\'s project allocation percentage' })
  async updateResource(
    @Request() req: any,
    @Param('id') id: string,
    @Param('employeeId') employeeId: string,
    @Body() dto: UpdateProjectMemberDto,
  ) {
    const result = await this.projectsService.updateMember(req.user.tenantId, id, employeeId, dto);
    return { data: result };
  }

  @Delete(':id/resources/:employeeId')
  @Roles(Role.ADMIN, Role.MANAGER, Role.HR)
  @ApiOperation({ summary: 'De-allocate a member from a project' })
  removeResource(
    @Request() req: any,
    @Param('id') id: string,
    @Param('employeeId') employeeId: string,
  ) {
    return this.projectsService.removeMember(req.user.tenantId, id, employeeId);
  }

  // --- Budget Tracker Endpoint ---
  @Get(':id/budget')
  @Roles(Role.ADMIN, Role.MANAGER, Role.FINANCE)
  @ApiOperation({ summary: 'Get project budget performance report' })
  async getBudget(@Request() req: any, @Param('id') id: string) {
    const result = await this.projectsService.getBudgetTracker(req.user.tenantId, id);
    return { data: result };
  }
}
