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
exports.ConfirmAndImportFormDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class ConfirmAndImportFormDto {
}
exports.ConfirmAndImportFormDto = ConfirmAndImportFormDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Signature returned by POST /normalization/detect' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ConfirmAndImportFormDto.prototype, "columnSignature", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'bank-of-x-daily-file' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ConfirmAndImportFormDto.prototype, "sourceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Bank of X - Daily Settlement File' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ConfirmAndImportFormDto.prototype, "sourceName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'BANK_TRANSFER' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ConfirmAndImportFormDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'JSON-encoded FileFormat object' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ConfirmAndImportFormDto.prototype, "fileFormat", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'JSON-encoded field mapping object, approved by the tenant' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ConfirmAndImportFormDto.prototype, "fieldMapping", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'JSON-encoded validation rules object' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConfirmAndImportFormDto.prototype, "validationRules", void 0);
//# sourceMappingURL=confirm-and-import-form.dto.js.map