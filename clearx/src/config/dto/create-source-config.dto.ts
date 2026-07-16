import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsObject,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class FileFormatDto {
  @ApiProperty({ example: 'csv' })
  @IsString()
  type: string;

  @ApiProperty({ example: ',', required: false })
  @IsOptional()
  @IsString()
  delimiter?: string;

  @ApiProperty({ example: 'utf-8', required: false })
  @IsOptional()
  @IsString()
  encoding?: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  hasHeader?: boolean;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  skipRows?: number;
}

export class CreateSourceConfigDto {
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

  @ApiProperty({ type: FileFormatDto })
  @ValidateNested()
  @Type(() => FileFormatDto)
  fileFormat: FileFormatDto;

  @ApiProperty({
    description: 'Map of target UnifiedTransaction field name to mapping rule',
    example: {
      primaryMatchKey: { strategy: 'single_field', fieldName: 'bank_txn_id' },
      amount: { fieldName: 'amount', transform: 'divide:100' },
    },
  })
  @IsObject()
  fieldMapping: Record<string, any>;

  @ApiProperty({
    required: false,
    example: { minAmount: 0, maxAmount: 1000000, requiredFields: ['bank_txn_id', 'amount'] },
  })
  @IsOptional()
  @IsObject()
  validationRules?: Record<string, any>;
}
