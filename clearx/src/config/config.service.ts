import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  TenantSourceConfig,
  TenantSourceConfigDocument,
} from './schemas/tenant-source-config.schema';
import { AuditLog, AuditLogDocument } from './schemas/audit-log.schema';
import { CreateSourceConfigDto } from './dto/create-source-config.dto';

@Injectable()
export class TenantConfigService {
  constructor(
    @InjectModel(TenantSourceConfig.name)
    private readonly sourceConfigModel: Model<TenantSourceConfigDocument>,
    @InjectModel(AuditLog.name)
    private readonly auditLogModel: Model<AuditLogDocument>,
  ) {}

  async createSourceConfig(
    tenantId: string,
    dto: CreateSourceConfigDto,
  ): Promise<TenantSourceConfig> {
    const existing = await this.sourceConfigModel.findOne({
      tenantId,
      sourceId: dto.sourceId,
    });
    if (existing) {
      throw new ConflictException(
        `A source config with sourceId "${dto.sourceId}" already exists for this tenant`,
      );
    }

    const created = await this.sourceConfigModel.create({ ...dto, tenantId });

    await this.recordAudit(tenantId, 'SOURCE_CONFIG_CREATED', 'TenantSourceConfig', dto.sourceId, {
      sourceName: dto.sourceName,
    });

    return created.toObject();
  }

  async findAllSourceConfigs(tenantId: string): Promise<TenantSourceConfig[]> {
    return this.sourceConfigModel.find({ tenantId }).lean().exec();
  }

  async findSourceConfig(tenantId: string, sourceId: string): Promise<TenantSourceConfig> {
    const config = await this.sourceConfigModel.findOne({ tenantId, sourceId }).lean().exec();
    if (!config) {
      throw new NotFoundException(`Source config "${sourceId}" not found for tenant`);
    }
    return config;
  }

  async recordAudit(
    tenantId: string,
    action: string,
    entity: string,
    entityId?: string,
    details: Record<string, any> = {},
  ): Promise<void> {
    await this.auditLogModel.create({
      tenantId,
      action,
      entity,
      entityId,
      timestamp: new Date(),
      details,
    });
  }
}
