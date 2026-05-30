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
import { MilestonesService } from './milestones.service';
import { CreateMilestoneDto, UpdateMilestoneDto } from './dto/project.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '@repo/db';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Project Management - Milestones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('milestones')
export class MilestonesController {
  constructor(private readonly milestonesService: MilestonesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Create a new milestone' })
  async create(@Request() req: any, @Body() createMilestoneDto: CreateMilestoneDto) {
    const result = await this.milestonesService.create(req.user.tenantId, createMilestoneDto);
    return { data: result };
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.HR, Role.FINANCE, Role.EMPLOYEE)
  @ApiOperation({ summary: 'Get all milestones, optionally filtered by projectId' })
  async findAll(@Request() req: any, @Query('projectId') projectId?: string) {
    const result = await this.milestonesService.findAll(req.user.tenantId, projectId);
    return { data: result };
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.HR, Role.FINANCE, Role.EMPLOYEE)
  @ApiOperation({ summary: 'Get a milestone by ID' })
  async findOne(@Request() req: any, @Param('id') id: string) {
    const result = await this.milestonesService.findOne(req.user.tenantId, id);
    return { data: result };
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Update a milestone' })
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateMilestoneDto: UpdateMilestoneDto,
  ) {
    const result = await this.milestonesService.update(req.user.tenantId, id, updateMilestoneDto);
    return { data: result };
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Delete a milestone' })
  remove(@Request() req: any, @Param('id') id: string) {
    return this.milestonesService.remove(req.user.tenantId, id);
  }
}
