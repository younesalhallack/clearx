import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Acme Bank' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'ops@acmebank.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'S3curePassw0rd!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'SAR', required: false })
  @IsOptional()
  @IsString()
  defaultCurrency?: string;

  @ApiProperty({ example: 'Asia/Riyadh', required: false })
  @IsOptional()
  @IsString()
  timezone?: string;
}
