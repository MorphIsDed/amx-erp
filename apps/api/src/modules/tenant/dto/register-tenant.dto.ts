import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterTenantDto {
  @ApiProperty({ example: 'Acme Corp' })
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiProperty({ example: 'acme' })
  @IsString()
  @IsNotEmpty()
  companyDomain: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  adminName: string;

  @ApiProperty({ example: 'admin@acme.com' })
  @IsEmail()
  adminEmail: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  adminPassword: string;
}
