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
exports.ReconciliationResult = exports.ReconciliationStatus = void 0;
const typeorm_1 = require("typeorm");
const unified_transaction_entity_1 = require("./unified-transaction.entity");
var ReconciliationStatus;
(function (ReconciliationStatus) {
    ReconciliationStatus["MATCHED"] = "MATCHED";
    ReconciliationStatus["PARTIAL_MATCH"] = "PARTIAL_MATCH";
    ReconciliationStatus["DISCREPANCY_AMOUNT"] = "DISCREPANCY_AMOUNT";
    ReconciliationStatus["DISCREPANCY_MISSING"] = "DISCREPANCY_MISSING";
    ReconciliationStatus["MANUALLY_MATCHED"] = "MANUALLY_MATCHED";
})(ReconciliationStatus || (exports.ReconciliationStatus = ReconciliationStatus = {}));
let ReconciliationResult = class ReconciliationResult {
};
exports.ReconciliationResult = ReconciliationResult;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ReconciliationResult.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], ReconciliationResult.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], ReconciliationResult.prototype, "transactionAId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => unified_transaction_entity_1.UnifiedTransaction, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'transactionAId' }),
    __metadata("design:type", unified_transaction_entity_1.UnifiedTransaction)
], ReconciliationResult.prototype, "transactionA", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], ReconciliationResult.prototype, "transactionBId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => unified_transaction_entity_1.UnifiedTransaction, { nullable: true, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'transactionBId' }),
    __metadata("design:type", Object)
], ReconciliationResult.prototype, "transactionB", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ReconciliationStatus }),
    __metadata("design:type", String)
], ReconciliationResult.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 3, default: 0 }),
    __metadata("design:type", String)
], ReconciliationResult.prototype, "amountDifference", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 3, nullable: true }),
    __metadata("design:type", Object)
], ReconciliationResult.prototype, "differenceCurrency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 64, default: 'SYSTEM' }),
    __metadata("design:type", String)
], ReconciliationResult.prototype, "matchedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], ReconciliationResult.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ReconciliationResult.prototype, "createdAt", void 0);
exports.ReconciliationResult = ReconciliationResult = __decorate([
    (0, typeorm_1.Entity)('reconciliation_results'),
    (0, typeorm_1.Index)(['tenantId', 'status'])
], ReconciliationResult);
//# sourceMappingURL=reconciliation-result.entity.js.map