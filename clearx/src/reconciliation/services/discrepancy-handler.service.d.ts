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
export declare class DiscrepancyHandlerService {
    classify(pair: MatchPair): ClassifiedMatch;
    classifyMissingInA(transactionB: UnifiedTransaction): ClassifiedMatch;
}
