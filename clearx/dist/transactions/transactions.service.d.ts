import { Repository } from 'typeorm';
import { UnifiedTransaction } from '../entities/unified-transaction.entity';
export interface TransactionQueryFilters {
    status?: string;
    source?: string;
    dateFrom?: string;
    dateTo?: string;
}
export declare class TransactionsService {
    private readonly transactionRepository;
    constructor(transactionRepository: Repository<UnifiedTransaction>);
    findAll(tenantId: string, filters: TransactionQueryFilters): Promise<UnifiedTransaction[]>;
}
