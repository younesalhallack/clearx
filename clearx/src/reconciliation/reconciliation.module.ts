import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnifiedTransaction } from '../entities/unified-transaction.entity';
import { ReconciliationResult } from '../entities/reconciliation-result.entity';
import { MatchingStrategyService } from './services/matching-strategy.service';
import { DiscrepancyHandlerService } from './services/discrepancy-handler.service';
import { ReconciliationResultService } from './services/reconciliation-result.service';
import { ReconciliationService } from './services/reconciliation.service';
import { ReconciliationController } from './reconciliation.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UnifiedTransaction, ReconciliationResult])],
  controllers: [ReconciliationController],
  providers: [
    MatchingStrategyService,
    DiscrepancyHandlerService,
    ReconciliationResultService,
    ReconciliationService,
  ],
  exports: [ReconciliationService],
})
export class ReconciliationModule {}
