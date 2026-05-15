import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PartialType, ApiProperty } from '@nestjs/swagger';
import { EmployeeStatus } from '@repo/db';

export class CreateEmployeeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ enum: EmployeeStatus })
  @IsEnum(EmployeeStatus)
  @IsOptional()
  status?: EmployeeStatus;

  @ApiProperty()
  @IsNotEmpty()
  hireDate: Date;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  departmentId: string;
}

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {}
