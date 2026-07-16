export declare enum SettlementStatus {
    GENERATED = "GENERATED",
    SENT = "SENT",
    EXECUTED = "EXECUTED",
    FAILED = "FAILED"
}
export declare class SettlementInstruction {
    id: string;
    tenantId: string;
    settlementCycleId: string;
    settlementDate: string;
    debtorName: string;
    debtorAccount: string;
    creditorName: string;
    creditorAccount: string;
    netAmount: string;
    currency: string;
    breakdown: string | null;
    status: SettlementStatus;
    externalReference: string | null;
    filePath: string | null;
    createdAt: Date;
}
