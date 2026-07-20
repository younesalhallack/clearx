import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';

/**
 * Payload for POST /normalization/confirm-and-import. Sent as multipart
 * form fields alongside the file (so the same upload that was analyzed
 * by /normalization/detect can be imported immediately once the tenant
 * approves the mapping — no need to re-pick the file).
 */
export class ConfirmSourceConfigDto {
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

  @ApiProperty({
    description: 'File format detected/confirmed for this upload',
    example: { type: 'csv', delimiter: ',', encoding: 'utf-8', hasHeader: true, skipRows: 0 },
  })
  @IsObject()
  fileFormat: Record<string, any>;

  @ApiProperty({
    description: 'Final field mapping approved by the tenant (may include manual overrides)',
  })
  @IsObject()
  fieldMapping: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  validationRules?: Record<string, any>;
}
