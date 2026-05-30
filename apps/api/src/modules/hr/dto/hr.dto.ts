import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LeaveType, LeaveStatus } from '@repo/db';

export class CreateLeaveDto {
  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({ enum: LeaveType })
  @IsEnum(LeaveType)
  type: LeaveType;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class UpdateLeaveStatusDto {
  @ApiProperty({ enum: LeaveStatus })
  @IsEnum(LeaveStatus)
  status: LeaveStatus;
}

export class UpdateEmployeeSalaryDto {
  @ApiProperty()
  @IsNumber()
  baseSalary: number;

  @ApiProperty()
  @IsNumber()
  allowances: number;

  @ApiProperty()
  @IsNumber()
  deductions: number;
}
