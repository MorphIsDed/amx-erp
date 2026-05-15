import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StockMovementType } from '@repo/db';

export class CreateProductDto {
  @ApiProperty({ example: 'SKU-001' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ example: 'Wireless Mouse' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'Electronics' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ example: 'pcs' })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiProperty({ example: 25.0 })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  vendorId?: string;
}

export class CreateWarehouseDto {
  @ApiProperty({ example: 'Main Warehouse' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'New York, NY' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

export class RecordMovementDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  warehouseId: string;

  @ApiProperty({ enum: StockMovementType })
  @IsEnum(StockMovementType)
  type: StockMovementType;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  reference?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  reason?: string;
}
