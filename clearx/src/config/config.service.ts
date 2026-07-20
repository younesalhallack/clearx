import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  TenantSourceConfig,
  TenantSourceConfigDocument,
} from './schemas/tenant-source-config.schema';
import { AuditLog, AuditLogDocument } from './schemas/audit-log.schema';
import { CreateSourceConfigDto } from './dto/create-source-config.dto';
import { ConfirmSourceConfigDto } from './dto/confirm-source-config.dto';

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

    const created = await this.sourceConfigModel.create({ ...dto, tenantId, confirmed: true });

    await this.recordAudit(tenantId, 'SOURCE_CONFIG_CREATED', 'TenantSourceConfig', dto.sourceId, {
      sourceName: dto.sourceName,
    });

    return created.toObject();
  }

  /**
   * Saves a source config produced via the auto-detect + human-confirm
   * flow (POST /normalization/detect -> POST /normalization/confirm-and-import).
   * Always marks `confirmed: true` — this method is only ever called after
   * the tenant has explicitly reviewed and approved the suggested mapping.
   */
  async saveConfirmedSourceConfig(
    tenantId: string,
    dto: ConfirmSourceConfigDto,
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

    const created = await this.sourceConfigModel.create({
      tenantId,
      sourceId: dto.sourceId,
      sourceName: dto.sourceName,
      paymentMethod: dto.paymentMethod,
      fileFormat: dto.fileFormat,
      fieldMapping: dto.fieldMapping,
      validationRules: dto.validationRules,
      columnSignature: dto.columnSignature,
      confirmed: true,
    });

    await this.recordAudit(
      tenantId,
      'SOURCE_CONFIG_CONFIRMED_FROM_DETECTION',
      'TenantSourceConfig',
      dto.sourceId,
      { sourceName: dto.sourceName, columnSignature: dto.columnSignature },
    );

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

  /**
   * Looks up a previously CONFIRMED config matching this exact column
   * signature. A match means "we recognize this file shape and the
   * tenant already approved how to map it" — the upload flow uses this
   * to skip the confirmation step entirely on repeat uploads of the same
   * shape.
   */
  async findByColumnSignature(
    tenantId: string,
    columnSignature: string,
  ): Promise<TenantSourceConfig | null> {
    return this.sourceConfigModel
      .findOne({ tenantId, columnSignature, confirmed: true })
      .lean()
      .exec();
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
