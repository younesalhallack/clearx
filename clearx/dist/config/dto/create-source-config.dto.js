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
exports.CreateSourceConfigDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class FileFormatDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'csv' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FileFormatDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ',', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FileFormatDto.prototype, "delimiter", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'utf-8', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FileFormatDto.prototype, "encoding", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, default: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], FileFormatDto.prototype, "hasHeader", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, default: 0 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], FileFormatDto.prototype, "skipRows", void 0);
class CreateSourceConfigDto {
}
exports.CreateSourceConfigDto = CreateSourceConfigDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'bank-of-x-daily-file' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSourceConfigDto.prototype, "sourceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Bank of X - Daily Settlement File' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSourceConfigDto.prototype, "sourceName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'BANK_TRANSFER' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSourceConfigDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: FileFormatDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => FileFormatDto),
    __metadata("design:type", FileFormatDto)
], CreateSourceConfigDto.prototype, "fileFormat", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Map of target UnifiedTransaction field name to mapping rule',
        example: {
            primaryMatchKey: { strategy: 'single_field', fieldName: 'bank_txn_id' },
            amount: { fieldName: 'amount', transform: 'divide:100' },
        },
    }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateSourceConfigDto.prototype, "fieldMapping", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        example: { minAmount: 0, maxAmount: 1000000, requiredFields: ['bank_txn_id', 'amount'] },
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateSourceConfigDto.prototype, "validationRules", void 0);
//# sourceMappingURL=create-source-config.dto.js.map