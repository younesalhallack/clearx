import { Injectable, Logger } from '@nestjs/common';
import { UnifiedTransaction } from '../../entities/unified-transaction.entity';

export interface MatchPair {
  transactionA: UnifiedTransaction;
  transactionB: UnifiedTransaction | null;
}

/**
 * Implements the matching strategies used by the reconciliation engine to
 * pair transactions from two sources by their primaryMatchKey.
 */
@Injectable()
export class MatchingStrategyService {
  private readonly logger = new Logger(MatchingStrategyService.name);

  /**
   * Pairs each transaction in `sourceA` with, at most, one transaction in
   * `sourceB` sharing the same primaryMatchKey. Any transaction in
   * `sourceA` without a counterpart is returned with `transactionB: null`
   * (MISSING_IN_B). Any leftover, unpaired transaction in `sourceB` is
   * also returned as a "missing in A" pair, with A and B swapped by the
   * caller if desired — callers should inspect `transactionB` presence
   * rather than assume ordering.
   */
  exactMatch1to1(
    sourceA: UnifiedTransaction[],
    sourceB: UnifiedTransaction[],
  ): { pairs: MatchPair[]; unmatchedB: UnifiedTransaction[] } {
    const bByKey = new Map<string, UnifiedTransaction[]>();
    for (const txn of sourceB) {
      const bucket = bByKey.get(txn.primaryMatchKey) ?? [];
      bucket.push(txn);
      bByKey.set(txn.primaryMatchKey, bucket);
    }

    const pairs: MatchPair[] = [];
    const consumedBIds = new Set<string>();

    for (const txnA of sourceA) {
      const candidates = bByKey.get(txnA.primaryMatchKey) ?? [];
      const candidate = candidates.find((c) => !consumedBIds.has(c.id));

      if (candidate) {
        consumedBIds.add(candidate.id);
        pairs.push({ transactionA: txnA, transactionB: candidate });
      } else {
        pairs.push({ transactionA: txnA, transactionB: null });
      }
    }

    const unmatchedB = sourceB.filter((txn) => !consumedBIds.has(txn.id));

    this.logger.log(
      `exactMatch1to1: ${pairs.length} A-side records processed, ${unmatchedB.length} unmatched B-side records`,
    );

    return { pairs, unmatchedB };
  }

  /**
   * Placeholder for future aggregate matching (e.g. many-to-one, where
   * several small transactions on one side sum to a single transaction
   * on the other side). Not yet implemented.
   */
  aggregateMatch(
    _sourceA: UnifiedTransaction[],
    _sourceB: UnifiedTransaction[],
  ): MatchPair[] {
    throw new Error('aggregateMatch strategy is not yet implemented');
  }

  /**
   * Placeholder for future fuzzy matching (e.g. tolerance-based amount
   * matching, approximate string matching on references). Not yet
   * implemented.
   */
  fuzzyMatch(
    _sourceA: UnifiedTransaction[],
    _sourceB: UnifiedTransaction[],
    _toleranceOptions?: Record<string, any>,
  ): MatchPair[] {
    throw new Error('fuzzyMatch strategy is not yet implemented');
  }
}
