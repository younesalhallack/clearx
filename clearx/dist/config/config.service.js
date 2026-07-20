"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantConfigService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const tenant_source_config_schema_1 = require("./schemas/tenant-source-config.schema");
const audit_log_schema_1 = require("./schemas/audit-log.schema");
let TenantConfigService = class TenantConfigService {
    constructor(sourceConfigModel, auditLogModel) {
        this.sourceConfigModel = sourceConfigModel;
        this.auditLogModel = auditLogModel;
    }
    async createSourceConfig(tenantId, dto) {
        const existing = await this.sourceConfigModel.findOne({
            tenantId,
            sourceId: dto.sourceId,
        });
        if (existing) {
            throw new common_1.ConflictException(`A source config with sourceId "${dto.sourceId}" already exists for this tenant`);
        }
        const created = await this.sourceConfigModel.create({ ...dto, tenantId, confirmed: true });
        await this.recordAudit(tenantId, 'SOURCE_CONFIG_CREATED', 'TenantSourceConfig', dto.sourceId, {
            sourceName: dto.sourceName,
        });
        return created.toObject();
    }
    async saveConfirmedSourceConfig(tenantId, dto) {
        const existing = await this.sourceConfigModel.findOne({
            tenantId,
            sourceId: dto.sourceId,
        });
        if (existing) {
            throw new common_1.ConflictException(`A source config with sourceId "${dto.sourceId}" already exists for this tenant`);
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
        await this.recordAudit(tenantId, 'SOURCE_CONFIG_CONFIRMED_FROM_DETECTION', 'TenantSourceConfig', dto.sourceId, { sourceName: dto.sourceName, columnSignature: dto.columnSignature });
        return created.toObject();
    }
    async findAllSourceConfigs(tenantId) {
        return this.sourceConfigModel.find({ tenantId }).lean().exec();
    }
    async findSourceConfig(tenantId, sourceId) {
        const config = await this.sourceConfigModel.findOne({ tenantId, sourceId }).lean().exec();
        if (!config) {
            throw new common_1.NotFoundException(`Source config "${sourceId}" not found for tenant`);
        }
        return config;
    }
    async findByColumnSignature(tenantId, columnSignature) {
        return this.sourceConfigModel
            .findOne({ tenantId, columnSignature, confirmed: true })
            .lean()
            .exec();
    }
    async recordAudit(tenantId, action, entity, entityId, details = {}) {
        await this.auditLogModel.create({
            tenantId,
            action,
            entity,
            entityId,
            timestamp: new Date(),
            details,
        });
    }
};
exports.TenantConfigService = TenantConfigService;
exports.TenantConfigService = TenantConfigService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(tenant_source_config_schema_1.TenantSourceConfig.name)),
    __param(1, (0, mongoose_1.InjectModel)(audit_log_schema_1.AuditLog.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], TenantConfigService);
//# sourceMappingURL=config.service.js.map