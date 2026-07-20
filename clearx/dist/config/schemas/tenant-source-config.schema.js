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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantSourceConfigSchema = exports.TenantSourceConfig = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let FieldMappingRule = class FieldMappingRule {
};
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], FieldMappingRule.prototype, "strategy", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], FieldMappingRule.prototype, "fieldName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], FieldMappingRule.prototype, "transform", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], FieldMappingRule.prototype, "defaultValue", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], FieldMappingRule.prototype, "format", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String] }),
    __metadata("design:type", Array)
], FieldMappingRule.prototype, "fields", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], FieldMappingRule.prototype, "condition", void 0);
FieldMappingRule = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], FieldMappingRule);
let FileFormat = class FileFormat {
};
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], FileFormat.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: ',' }),
    __metadata("design:type", String)
], FileFormat.prototype, "delimiter", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'utf-8' }),
    __metadata("design:type", String)
], FileFormat.prototype, "encoding", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], FileFormat.prototype, "hasHeader", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], FileFormat.prototype, "skipRows", void 0);
FileFormat = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], FileFormat);
let ValidationRules = class ValidationRules {
};
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], ValidationRules.prototype, "minAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], ValidationRules.prototype, "maxAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], ValidationRules.prototype, "requiredFields", void 0);
ValidationRules = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], ValidationRules);
let TenantSourceConfig = class TenantSourceConfig {
};
exports.TenantSourceConfig = TenantSourceConfig;
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], TenantSourceConfig.prototype, "tenantId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], TenantSourceConfig.prototype, "sourceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], TenantSourceConfig.prototype, "sourceName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], TenantSourceConfig.prototype, "paymentMethod", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: FileFormat, required: true }),
    __metadata("design:type", FileFormat)
], TenantSourceConfig.prototype, "fileFormat", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, required: true }),
    __metadata("design:type", Object)
], TenantSourceConfig.prototype, "fieldMapping", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: ValidationRules, default: {} }),
    __metadata("design:type", ValidationRules)
], TenantSourceConfig.prototype, "validationRules", void 0);
__decorate([
    (0, mongoose_1.Prop)({ index: true }),
    __metadata("design:type", String)
], TenantSourceConfig.prototype, "columnSignature", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], TenantSourceConfig.prototype, "confirmed", void 0);
exports.TenantSourceConfig = TenantSourceConfig = __decorate([
    (0, mongoose_1.Schema)({ collection: 'tenant_source_configs', timestamps: true })
], TenantSourceConfig);
exports.TenantSourceConfigSchema = mongoose_1.SchemaFactory.createForClass(TenantSourceConfig);
exports.TenantSourceConfigSchema.index({ tenantId: 1, sourceId: 1 }, { unique: true });
exports.TenantSourceConfigSchema.index({ tenantId: 1, columnSignature: 1 });
//# sourceMappingURL=tenant-source-config.schema.js.map