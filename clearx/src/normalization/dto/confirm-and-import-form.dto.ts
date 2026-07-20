import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

/**
 * Multipart form fields for POST /normalization/confirm-and-import.
 * Structured data (fileFormat, fieldMapping, validationRules) travels as
 * JSON-encoded strings because they ride alongside a file in a
 * multipart/form-data request — the controller parses them before
 * handing off to TenantConfigService.
 */
export class ConfirmAndImportFormDto {
  @ApiProperty({ description: 'Signature returned by POST /normalization/detect' })
  @IsString()
  @IsNotEmpty()
  columnSignature: string;

  @ApiProperty({ example: 'bank-of-x-daily-file' })
  @IsString()
  @IsNotEmpty()
  sourceId: string;

  @ApiProperty({ example: 'Bank of X - Daily Settlement File' })
  @IsString()
  @IsNotEmpty()
  sourceName: string;

  @ApiProperty({ example: 'BANK_TRANSFER' })
  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @ApiProperty({ description: 'JSON-encoded FileFormat object' })
  @IsString()
  @IsNotEmpty()
  fileFormat: string;

  @ApiProperty({ description: 'JSON-encoded field mapping object, approved by the tenant' })
  @IsString()
  @IsNotEmpty()
  fieldMapping: string;

  @ApiProperty({ required: false, description: 'JSON-encoded validation rules object' })
  @IsOptional()
  @IsString()
  validationRules?: string;
}
