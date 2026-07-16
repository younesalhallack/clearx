import { TransactionsService } from './transactions.service';
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    findAll(req: any, status?: string, source?: string, dateFrom?: string, dateTo?: string): Promise<import("../entities/unified-transaction.entity").UnifiedTransaction[]>;
}
