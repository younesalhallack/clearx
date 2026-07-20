import { Model } from 'mongoose';
import { TenantSourceConfig, TenantSourceConfigDocument } from './schemas/tenant-source-config.schema';
import { AuditLogDocument } from './schemas/audit-log.schema';
import { CreateSourceConfigDto } from './dto/create-source-config.dto';
import { ConfirmSourceConfigDto } from './dto/confirm-source-config.dto';
export declare class TenantConfigService {
    private readonly sourceConfigModel;
    private readonly auditLogModel;
    constructor(sourceConfigModel: Model<TenantSourceConfigDocument>, auditLogModel: Model<AuditLogDocument>);
    createSourceConfig(tenantId: string, dto: CreateSourceConfigDto): Promise<TenantSourceConfig>;
    saveConfirmedSourceConfig(tenantId: string, dto: ConfirmSourceConfigDto): Promise<TenantSourceConfig>;
    findAllSourceConfigs(tenantId: string): Promise<TenantSourceConfig[]>;
    findSourceConfig(tenantId: string, sourceId: string): Promise<TenantSourceConfig>;
    findByColumnSignature(tenantId: string, columnSignature: string): Promise<TenantSourceConfig | null>;
    recordAudit(tenantId: string, action: string, entity: string, entityId?: string, details?: Record<string, any>): Promise<void>;
}
