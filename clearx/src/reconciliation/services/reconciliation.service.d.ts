import { Repository } from 'typeorm';
import { UnifiedTransaction, TransactionSource } from '../../entities/unified-transaction.entity';
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
export declare class ReconciliationService {
    private readonly transactionRepository;
    private readonly matchingStrategyService;
    private readonly discrepancyHandlerService;
    private readonly reconciliationResultService;
    private readonly logger;
    constructor(transactionRepository: Repository<UnifiedTransaction>, matchingStrategyService: MatchingStrategyService, discrepancyHandlerService: DiscrepancyHandlerService, reconciliationResultService: ReconciliationResultService);
    runCycle(params: RunReconciliationParams): Promise<ReconciliationCycleSummary>;
}
