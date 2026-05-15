import { IsEmail, IsNotEmpty, IsString, IsNumber, IsOptional, IsEnum, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { InvoiceStatus } from '@repo/db';

class InvoiceItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsNumber()
  unitPrice: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  taxRate?: number;
}

export class CreateInvoiceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  invoiceNumber: string;

  @ApiProperty()
  @IsDateString()
  issueDate: string;

  @ApiProperty()
  @IsDateString()
  dueDate: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  exchangeRate?: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  clientName: string;

  @ApiProperty({ required: false })
  @IsEmail()
  @IsOptional()
  clientEmail?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  clientAddress?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ type: [InvoiceItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];
}

export class UpdateInvoiceStatusDto {
  @ApiProperty({ enum: InvoiceStatus })
  @IsEnum(InvoiceStatus)
  status: InvoiceStatus;
}
