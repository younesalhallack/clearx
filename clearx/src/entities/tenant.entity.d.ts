export declare enum TenantStatus {
    ACTIVE = "active",
    SUSPENDED = "suspended",
    TRIAL = "trial"
}
export declare class Tenant {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    defaultCurrency: string;
    timezone: string;
    status: TenantStatus;
    tenantId: string;
    createdAt: Date;
    updatedAt: Date;
}
