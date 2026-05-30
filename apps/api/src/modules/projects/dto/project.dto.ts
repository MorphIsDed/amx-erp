import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  ProjectStatus,
  MilestoneStatus,
  TaskPriority,
  TaskStatus,
} from '@repo/db';

export class CreateProjectDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  projectCode: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: ProjectStatus, required: false })
  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @ApiProperty()
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty()
  @IsNotEmpty()
  endDate: Date;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  plannedBudget: number;
}

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  actualBudget?: number;
}

export class CreateMilestoneDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsNotEmpty()
  dueDate: Date;

  @ApiProperty({ enum: MilestoneStatus, required: false })
  @IsEnum(MilestoneStatus)
  @IsOptional()
  status?: MilestoneStatus;
}

export class UpdateMilestoneDto extends PartialType(CreateMilestoneDto) {}

export class CreateTaskDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  milestoneId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  assignedEmployeeId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: TaskPriority, required: false })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiProperty({ enum: TaskStatus, required: false })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  estimatedHours?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  actualHours?: number;

  @ApiProperty()
  @IsNotEmpty()
  dueDate: Date;
}

export class UpdateTaskDto extends PartialType(CreateTaskDto) {}

export class AddProjectMemberDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  allocationPercentage: number;
}

export class UpdateProjectMemberDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  allocationPercentage: number;
}

export class CreateTaskDependencyDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  predecessorTaskId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  successorTaskId: string;
}
