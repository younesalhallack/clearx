import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  ReconciliationResult,
  ReconciliationStatus,
} from '../../entities/reconciliation-result.entity';
import {
  UnifiedTransaction,
  TransactionStatus,
} from '../../entities/unified-transaction.entity';
import { ClassifiedMatch } from './discrepancy-handler.service';

@Injectable()
export class ReconciliationResultService {
  private readonly logger = new Logger(ReconciliationResultService.name);

  constructor(
    @InjectRepository(ReconciliationResult)
    private readonly resultRepository: Repository<ReconciliationResult>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Persists ReconciliationResult rows for a batch of classified matches
   * and updates the corresponding UnifiedTransaction statuses, all inside
   * a single database transaction to keep both tables consistent.
   */
  async saveResults(
    tenantId: string,
    classifiedMatches: ClassifiedMatch[],
  ): Promise<ReconciliationResult[]> {
    return this.dataSource.transaction(async (manager) => {
      const resultRepo = manager.getRepository(ReconciliationResult);
      const txnRepo = manager.getRepository(UnifiedTransaction);

      const results: ReconciliationResult[] = [];

      for (const match of classifiedMatches) {
        const result = resultRepo.create({
          tenantId,
          transactionAId: match.transactionA.id,
          transactionBId: match.transactionB?.id ?? null,
          status: match.status,
          amountDifference: match.amountDifference.toFixed(3),
          differenceCurrency: match.differenceCurrency,
          matchedBy: 'SYSTEM',
          notes: this.buildNotes(match),
        });
        results.push(result);

        const newStatusA =
          match.status === ReconciliationStatus.MATCHED
            ? TransactionStatus.MATCHED
            : match.status === ReconciliationStatus.DISCREPANCY_AMOUNT
              ? TransactionStatus.DISCREPANCY
              : TransactionStatus.UNMATCHED;

        await txnRepo.update({ id: match.transactionA.id }, { status: newStatusA });

        if (match.transactionB) {
          const newStatusB =
            match.status === ReconciliationStatus.MATCHED
              ? TransactionStatus.MATCHED
              : TransactionStatus.DISCREPANCY;
          await txnRepo.update({ id: match.transactionB.id }, { status: newStatusB });
        }
      }

      const saved = await resultRepo.save(results);
      this.logger.log(`Saved ${saved.length} reconciliation results for tenant ${tenantId}`);
      return saved;
    });
  }

  private buildNotes(match: ClassifiedMatch): string | null {
    if (match.status === ReconciliationStatus.DISCREPANCY_MISSING) {
      return match.transactionB
        ? 'Missing counterpart transaction'
        : 'No matching transaction found on the opposite source';
    }
    if (match.status === ReconciliationStatus.DISCREPANCY_AMOUNT) {
      return `Amount mismatch of ${match.amountDifference} ${match.differenceCurrency ?? ''}`.trim();
    }
    return null;
  }
}
