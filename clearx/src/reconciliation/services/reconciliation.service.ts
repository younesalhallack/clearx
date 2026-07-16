import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import {
  UnifiedTransaction,
  TransactionStatus,
  TransactionSource,
} from '../../entities/unified-transaction.entity';
import { MatchingStrategyService } from './matching-strategy.service';
import { DiscrepancyHandlerService } from './discrepancy-handler.service';
import { ReconciliationResultService } from './reconciliation-result.service';

export interface RunReconciliationParams {
  tenantId: string;
  sourceA: TransactionSource | string;
  sourceB: TransactionSource | string;
}

export interface ReconciliationCycleSummary {
  cycleId: string;
  totalA: number;
  totalB: number;
  matched: number;
  discrepancyAmount: number;
  discrepancyMissing: number;
}

/**
 * Orchestrates a full reconciliation cycle between two sources for a
 * given tenant: loads pending transactions from both sources, runs the
 * exact 1:1 matching strategy, classifies each outcome, and persists
 * results while updating transaction statuses.
 */
@Injectable()
export class ReconciliationService {
  private readonly logger = new Logger(ReconciliationService.name);

  constructor(
    @InjectRepository(UnifiedTransaction)
    private readonly transactionRepository: Repository<UnifiedTransaction>,
    private readonly matchingStrategyService: MatchingStrategyService,
    private readonly discrepancyHandlerService: DiscrepancyHandlerService,
    private readonly reconciliationResultService: ReconciliationResultService,
  ) {}

  async runCycle(params: RunReconciliationParams): Promise<ReconciliationCycleSummary> {
    const { tenantId, sourceA, sourceB } = params;
    const cycleId = uuidv4();

    const [txnsA, txnsB] = await Promise.all([
      this.transactionRepository.find({
        where: { tenantId, source: sourceA as TransactionSource, status: TransactionStatus.PENDING },
      }),
      this.transactionRepository.find({
        where: { tenantId, source: sourceB as TransactionSource, status: TransactionStatus.PENDING },
      }),
    ]);

    const { pairs, unmatchedB } = this.matchingStrategyService.exactMatch1to1(txnsA, txnsB);

    const classifiedMatches = pairs.map((pair) => this.discrepancyHandlerService.classify(pair));
    const classifiedMissingB = unmatchedB.map((txn) =>
      this.discrepancyHandlerService.classifyMissingInA(txn),
    );

    const allClassified = [...classifiedMatches, ...classifiedMissingB];
    await this.reconciliationResultService.saveResults(tenantId, allClassified);

    const summary: ReconciliationCycleSummary = {
      cycleId,
      totalA: txnsA.length,
      totalB: txnsB.length,
      matched: allClassified.filter((m) => m.status === 'MATCHED').length,
      discrepancyAmount: allClassified.filter((m) => m.status === 'DISCREPANCY_AMOUNT').length,
      discrepancyMissing: allClassified.filter((m) => m.status === 'DISCREPANCY_MISSING').length,
    };

    this.logger.log(
      `Reconciliation cycle ${cycleId} complete for tenant ${tenantId}: ${JSON.stringify(summary)}`,
    );

    return summary;
  }
}
