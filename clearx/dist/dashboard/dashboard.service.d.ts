import { Repository } from 'typeorm';
import { UnifiedTransaction } from '../entities/unified-transaction.entity';
import { SettlementInstruction } from '../entities/settlement-instruction.entity';
export interface DashboardSummary {
    totalTransactions: number;
    matchedCount: number;
    matchedPercentage: number;
    unmatchedCount: number;
    discrepancyCount: number;
    netSettlementAmount: string;
}
export declare class DashboardService {
    private readonly transactionRepository;
    private readonly instructionRepository;
    constructor(transactionRepository: Repository<UnifiedTransaction>, instructionRepository: Repository<SettlementInstruction>);
    getSummary(tenantId: string): Promise<DashboardSummary>;
}
