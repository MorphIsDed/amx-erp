import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional, IsArray, ValidateNested, IsDateString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AccountType, JournalEntryStatus, AccountingPeriodStatus } from '@repo/db';

export class CreateAccountDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: AccountType })
  @IsEnum(AccountType)
  type: AccountType;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  balance?: number;
}

export class CreateJournalLineDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  accountId: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  debit?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  credit?: number;
}

export class CreateJournalEntryDto {
  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  periodId: string;

  @ApiProperty({ type: [CreateJournalLineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateJournalLineDto)
  lines: CreateJournalLineDto[];
}

export class CreatePeriodDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty()
  @IsDateString()
  endDate: string;
}

export class RecordPaymentDto {
  @ApiProperty()
  @IsNumber()
  amount: number;
}
