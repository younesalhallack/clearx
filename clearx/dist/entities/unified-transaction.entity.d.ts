export declare enum PaymentMethod {
    CARD = "CARD",
    EBPP = "EBPP",
    BANK_TRANSFER = "BANK_TRANSFER",
    WALLET = "WALLET",
    DIRECT_DEBIT = "DIRECT_DEBIT"
}
export declare enum TransactionType {
    CREDIT = "CREDIT",
    DEBIT = "DEBIT"
}
export declare enum TransactionStatus {
    PENDING = "PENDING",
    MATCHED = "MATCHED",
    UNMATCHED = "UNMATCHED",
    DISCREPANCY = "DISCREPANCY",
    IGNORED = "IGNORED"
}
export declare enum TransactionSource {
    POS = "POS",
    ECOM = "ECOM",
    ATM = "ATM",
    BANK_FILE = "BANK_FILE",
    SWITCH = "SWITCH",
    PSP = "PSP",
    BILLING_SYSTEM = "BILLING_SYSTEM"
}
export declare class UnifiedTransaction {
    id: string;
    tenantId: string;
    paymentMethod: PaymentMethod;
    primaryMatchKey: string;
    rrn: string | null;
    stan: string | null;
    billingNumber: string | null;
    subscriberId: string | null;
    bankTransactionId: string | null;
    ebppTransactionId: string | null;
    bankReference: string | null;
    originalReference: string | null;
    amount: string;
    currency: string;
    type: TransactionType;
    transactionDate: Date;
    cardBin: string | null;
    terminalId: string | null;
    merchantId: string | null;
    billingCompany: string | null;
    payerName: string | null;
    payerAccount: string | null;
    status: TransactionStatus;
    source: TransactionSource;
    sourceFileName: string;
    ingestedAt: Date;
    rawPayload: Record<string, any> | null;
    createdAt: Date;
}
