import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RunReconciliationDto {
  @ApiProperty({ example: 'SWITCH', description: 'TransactionSource enum value for side A' })
  @IsString()
  @IsNotEmpty()
  sourceA: string;

  @ApiProperty({ example: 'BANK_FILE', description: 'TransactionSource enum value for side B' })
  @IsString()
  @IsNotEmpty()
  sourceB: string;
}
