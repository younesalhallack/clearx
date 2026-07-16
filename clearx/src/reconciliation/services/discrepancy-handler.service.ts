import { Injectable } from '@nestjs/common';
import { UnifiedTransaction } from '../../entities/unified-transaction.entity';
import { ReconciliationStatus } from '../../entities/reconciliation-result.entity';
import { MatchPair } from './matching-strategy.service';

export interface ClassifiedMatch {
  transactionA: UnifiedTransaction;
  transactionB: UnifiedTransaction | null;
  status: ReconciliationStatus;
  amountDifference: number;
  differenceCurrency: string | null;
}

const AMOUNT_TOLERANCE = 0.0001;

/**
 * Classifies the outcome of each matched (or unmatched) pair produced by
 * the matching engine, and computes any amount difference.
 */
@Injectable()
export class DiscrepancyHandlerService {
  classify(pair: MatchPair): ClassifiedMatch {
    const { transactionA, transactionB } = pair;

    if (!transactionB) {
      return {
        transactionA,
        transactionB: null,
        status: ReconciliationStatus.DISCREPANCY_MISSING,
        amountDifference: parseFloat(transactionA.amount),
        differenceCurrency: transactionA.currency,
      };
    }

    const amountA = parseFloat(transactionA.amount);
    const amountB = parseFloat(transactionB.amount);
    const difference = Math.round((amountA - amountB) * 1000) / 1000;

    if (Math.abs(difference) > AMOUNT_TOLERANCE) {
      return {
        transactionA,
        transactionB,
        status: ReconciliationStatus.DISCREPANCY_AMOUNT,
        amountDifference: difference,
        differenceCurrency: transactionA.currency,
      };
    }

    return {
      transactionA,
      transactionB,
      status: ReconciliationStatus.MATCHED,
      amountDifference: 0,
      differenceCurrency: null,
    };
  }

  /**
   * Builds a classification entry for a transaction that exists only on
   * the "B" side (i.e. was left over after matching), representing a
   * MISSING_IN_A discrepancy.
   */
  classifyMissingInA(transactionB: UnifiedTransaction): ClassifiedMatch {
    return {
      transactionA: transactionB,
      transactionB: null,
      status: ReconciliationStatus.DISCREPANCY_MISSING,
      amountDifference: parseFloat(transactionB.amount),
      differenceCurrency: transactionB.currency,
    };
  }
}
