import { DataSource, Repository } from 'typeorm';
import { ReconciliationResult } from '../../entities/reconciliation-result.entity';
import { ClassifiedMatch } from './discrepancy-handler.service';
export declare class ReconciliationResultService {
    private readonly resultRepository;
    private readonly dataSource;
    private readonly logger;
    constructor(resultRepository: Repository<ReconciliationResult>, dataSource: DataSource);
    saveResults(tenantId: string, classifiedMatches: ClassifiedMatch[]): Promise<ReconciliationResult[]>;
    private buildNotes;
}
