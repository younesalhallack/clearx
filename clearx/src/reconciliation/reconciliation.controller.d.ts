import { ReconciliationService } from './services/reconciliation.service';
import { RunReconciliationDto } from './dto/run-reconciliation.dto';
import { Repository } from 'typeorm';
import { ReconciliationResult } from '../entities/reconciliation-result.entity';
export declare class ReconciliationController {
    private readonly reconciliationService;
    private readonly resultRepository;
    constructor(reconciliationService: ReconciliationService, resultRepository: Repository<ReconciliationResult>);
    run(req: any, dto: RunReconciliationDto): Promise<import("./services/reconciliation.service").ReconciliationCycleSummary>;
    findResults(req: any, status?: string): Promise<ReconciliationResult[]>;
}
