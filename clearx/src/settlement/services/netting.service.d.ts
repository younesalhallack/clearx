import { Repository } from 'typeorm';
import { ReconciliationResult } from '../../entities/reconciliation-result.entity';
import { SettlementInstruction } from '../../entities/settlement-instruction.entity';
export declare class NettingService {
    private readonly resultRepository;
    private readonly instructionRepository;
    private readonly logger;
    constructor(resultRepository: Repository<ReconciliationResult>, instructionRepository: Repository<SettlementInstruction>);
    generateInstructionsForCycle(tenantId: string, reconciliationResultIds: string[]): Promise<SettlementInstruction[]>;
}
