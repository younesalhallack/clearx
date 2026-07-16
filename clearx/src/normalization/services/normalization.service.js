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
var NormalizationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NormalizationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const unified_transaction_entity_1 = require("../../entities/unified-transaction.entity");
const file_parser_service_1 = require("./file-parser.service");
const field_transformer_service_1 = require("./field-transformer.service");
const match_key_resolver_service_1 = require("./match-key-resolver.service");
let NormalizationService = NormalizationService_1 = class NormalizationService {
    constructor(transactionRepository, fileParserService, fieldTransformerService, matchKeyResolverService) {
        this.transactionRepository = transactionRepository;
        this.fileParserService = fileParserService;
        this.fieldTransformerService = fieldTransformerService;
        this.matchKeyResolverService = matchKeyResolverService;
        this.logger = new common_1.Logger(NormalizationService_1.name);
    }
    async normalizeAndSave(tenantId, sourceConfig, filePath, fileName) {
        const formatOptions = {
            type: sourceConfig.fileFormat.type,
            delimiter: sourceConfig.fileFormat.delimiter,
            encoding: sourceConfig.fileFormat.encoding,
            hasHeader: sourceConfig.fileFormat.hasHeader,
            skipRows: sourceConfig.fileFormat.skipRows,
        };
        const rawRecords = await this.fileParserService.parseFile(filePath, formatOptions);
        const summary = {
            totalRecords: rawRecords.length,
            savedRecords: 0,
            rejectedRecords: 0,
            rejectionReasons: [],
        };
        const entitiesToSave = [];
        rawRecords.forEach((rawRecord, index) => {
            try {
                const validationError = this.validateRecord(rawRecord, sourceConfig);
                if (validationError) {
                    summary.rejectedRecords += 1;
                    summary.rejectionReasons.push({ index, reason: validationError });
                    return;
                }
                const normalized = this.fieldTransformerService.transformRecord(rawRecord, sourceConfig.fieldMapping);
                const primaryMatchKey = this.matchKeyResolverService.resolve(rawRecord, sourceConfig.fieldMapping['primaryMatchKey']);
                entitiesToSave.push({
                    tenantId,
                    paymentMethod: sourceConfig.paymentMethod,
                    primaryMatchKey,
                    ...normalized,
                    status: unified_transaction_entity_1.TransactionStatus.PENDING,
                    source: this.resolveSourceEnum(sourceConfig.paymentMethod),
                    sourceFileName: fileName,
                    ingestedAt: new Date(),
                    rawPayload: rawRecord,
                });
            }
            catch (error) {
                summary.rejectedRecords += 1;
                summary.rejectionReasons.push({ index, reason: error.message ?? 'Unknown error' });
            }
        });
        if (entitiesToSave.length > 0) {
            const saved = await this.transactionRepository.save(entitiesToSave);
            summary.savedRecords = saved.length;
        }
        this.logger.log(`Normalization complete for tenant ${tenantId}: ${summary.savedRecords}/${summary.totalRecords} saved`);
        return summary;
    }
    validateRecord(rawRecord, sourceConfig) {
        const rules = sourceConfig.validationRules;
        if (!rules)
            return null;
        if (rules.requiredFields?.length) {
            for (const field of rules.requiredFields) {
                if (rawRecord[field] === undefined ||
                    rawRecord[field] === null ||
                    rawRecord[field] === '') {
                    return `Missing required field: ${field}`;
                }
            }
        }
        const amountFieldRule = sourceConfig.fieldMapping['amount'];
        if (amountFieldRule?.fieldName) {
            const amount = parseFloat(rawRecord[amountFieldRule.fieldName]);
            if (!Number.isNaN(amount)) {
                if (rules.minAmount !== undefined && amount < rules.minAmount) {
                    return `Amount ${amount} below configured minimum ${rules.minAmount}`;
                }
                if (rules.maxAmount !== undefined && amount > rules.maxAmount) {
                    return `Amount ${amount} above configured maximum ${rules.maxAmount}`;
                }
            }
        }
        return null;
    }
    resolveSourceEnum(paymentMethod) {
        switch (paymentMethod) {
            case 'BANK_TRANSFER':
                return 'BANK_FILE';
            case 'CARD':
                return 'SWITCH';
            case 'EBPP':
                return 'BILLING_SYSTEM';
            default:
                return 'PSP';
        }
    }
};
exports.NormalizationService = NormalizationService;
exports.NormalizationService = NormalizationService = NormalizationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(unified_transaction_entity_1.UnifiedTransaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        file_parser_service_1.FileParserService,
        field_transformer_service_1.FieldTransformerService,
        match_key_resolver_service_1.MatchKeyResolverService])
], NormalizationService);
//# sourceMappingURL=normalization.service.js.map