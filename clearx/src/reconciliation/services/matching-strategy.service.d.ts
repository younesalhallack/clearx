import { UnifiedTransaction } from '../../entities/unified-transaction.entity';
export interface MatchPair {
    transactionA: UnifiedTransaction;
    transactionB: UnifiedTransaction | null;
}
export declare class MatchingStrategyService {
    private readonly logger;
    exactMatch1to1(sourceA: UnifiedTransaction[], sourceB: UnifiedTransaction[]): {
        pairs: MatchPair[];
        unmatchedB: UnifiedTransaction[];
    };
    aggregateMatch(_sourceA: UnifiedTransaction[], _sourceB: UnifiedTransaction[]): MatchPair[];
    fuzzyMatch(_sourceA: UnifiedTransaction[], _sourceB: UnifiedTransaction[], _toleranceOptions?: Record<string, any>): MatchPair[];
}
