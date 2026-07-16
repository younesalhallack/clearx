import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReconciliationResult } from '../entities/reconciliation-result.entity';
import { SettlementInstruction } from '../entities/settlement-instruction.entity';
import { NettingService } from './services/netting.service';

@Module({
  imports: [TypeOrmModule.forFeature([ReconciliationResult, SettlementInstruction])],
  providers: [NettingService],
  exports: [NettingService],
})
export class SettlementModule {}
