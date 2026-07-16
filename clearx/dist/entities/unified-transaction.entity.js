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
exports.UnifiedTransaction = exports.TransactionSource = exports.TransactionStatus = exports.TransactionType = exports.PaymentMethod = void 0;
const typeorm_1 = require("typeorm");
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CARD"] = "CARD";
    PaymentMethod["EBPP"] = "EBPP";
    PaymentMethod["BANK_TRANSFER"] = "BANK_TRANSFER";
    PaymentMethod["WALLET"] = "WALLET";
    PaymentMethod["DIRECT_DEBIT"] = "DIRECT_DEBIT";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var TransactionType;
(function (TransactionType) {
    TransactionType["CREDIT"] = "CREDIT";
    TransactionType["DEBIT"] = "DEBIT";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "PENDING";
    TransactionStatus["MATCHED"] = "MATCHED";
    TransactionStatus["UNMATCHED"] = "UNMATCHED";
    TransactionStatus["DISCREPANCY"] = "DISCREPANCY";
    TransactionStatus["IGNORED"] = "IGNORED";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
var TransactionSource;
(function (TransactionSource) {
    TransactionSource["POS"] = "POS";
    TransactionSource["ECOM"] = "ECOM";
    TransactionSource["ATM"] = "ATM";
    TransactionSource["BANK_FILE"] = "BANK_FILE";
    TransactionSource["SWITCH"] = "SWITCH";
    TransactionSource["PSP"] = "PSP";
    TransactionSource["BILLING_SYSTEM"] = "BILLING_SYSTEM";
})(TransactionSource || (exports.TransactionSource = TransactionSource = {}));
let UnifiedTransaction = class UnifiedTransaction {
};
exports.UnifiedTransaction = UnifiedTransaction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UnifiedTransaction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], UnifiedTransaction.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: PaymentMethod }),
    __metadata("design:type", String)
], UnifiedTransaction.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], UnifiedTransaction.prototype, "primaryMatchKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], UnifiedTransaction.prototype, "rrn", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], UnifiedTransaction.prototype, "stan", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], UnifiedTransaction.prototype, "billingNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], UnifiedTransaction.prototype, "subscriberId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], UnifiedTransaction.prototype, "bankTransactionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], UnifiedTransaction.prototype, "ebppTransactionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], UnifiedTransaction.prototype, "bankReference", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], UnifiedTransaction.prototype, "originalReference", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 3 }),
    __metadata("design:type", String)
], UnifiedTransaction.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 3 }),
    __metadata("design:type", String)
], UnifiedTransaction.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: TransactionType }),
    __metadata("design:type", String)
], UnifiedTransaction.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], UnifiedTransaction.prototype, "transactionDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 32, nullable: true }),
    __metadata("design:type", Object)
], UnifiedTransaction.prototype, "cardBin", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 64, nullable: true }),
    __metadata("design:type", Object)
], UnifiedTransaction.prototype, "terminalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 64, nullable: true }),
    __metadata("design:type", Object)
], UnifiedTransaction.prototype, "merchantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], UnifiedTransaction.prototype, "billingCompany", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], UnifiedTransaction.prototype, "payerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], UnifiedTransaction.prototype, "payerAccount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.PENDING }),
    __metadata("design:type", String)
], UnifiedTransaction.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: TransactionSource }),
    __metadata("design:type", String)
], UnifiedTransaction.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 512 }),
    __metadata("design:type", String)
], UnifiedTransaction.prototype, "sourceFileName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], UnifiedTransaction.prototype, "ingestedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], UnifiedTransaction.prototype, "rawPayload", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], UnifiedTransaction.prototype, "createdAt", void 0);
exports.UnifiedTransaction = UnifiedTransaction = __decorate([
    (0, typeorm_1.Entity)('unified_transactions'),
    (0, typeorm_1.Index)(['tenantId', 'primaryMatchKey']),
    (0, typeorm_1.Index)(['tenantId', 'status']),
    (0, typeorm_1.Index)(['tenantId', 'source'])
], UnifiedTransaction);
//# sourceMappingURL=unified-transaction.entity.js.map