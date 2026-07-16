import { UnifiedTransaction } from './unified-transaction.entity';
export declare enum ReconciliationStatus {
    MATCHED = "MATCHED",
    PARTIAL_MATCH = "PARTIAL_MATCH",
    DISCREPANCY_AMOUNT = "DISCREPANCY_AMOUNT",
    DISCREPANCY_MISSING = "DISCREPANCY_MISSING",
    MANUALLY_MATCHED = "MANUALLY_MATCHED"
}
export declare class ReconciliationResult {
    id: string;
    tenantId: string;
    transactionAId: string;
    transactionA: UnifiedTransaction;
    transactionBId: string | null;
    transactionB: UnifiedTransaction | null;
    status: ReconciliationStatus;
    amountDifference: string;
    differenceCurrency: string | null;
    matchedBy: string;
    notes: string | null;
    createdAt: Date;
}
