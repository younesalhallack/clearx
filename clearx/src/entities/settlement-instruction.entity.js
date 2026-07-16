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
exports.SettlementInstruction = exports.SettlementStatus = void 0;
const typeorm_1 = require("typeorm");
var SettlementStatus;
(function (SettlementStatus) {
    SettlementStatus["GENERATED"] = "GENERATED";
    SettlementStatus["SENT"] = "SENT";
    SettlementStatus["EXECUTED"] = "EXECUTED";
    SettlementStatus["FAILED"] = "FAILED";
})(SettlementStatus || (exports.SettlementStatus = SettlementStatus = {}));
let SettlementInstruction = class SettlementInstruction {
};
exports.SettlementInstruction = SettlementInstruction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SettlementInstruction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], SettlementInstruction.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 128 }),
    __metadata("design:type", String)
], SettlementInstruction.prototype, "settlementCycleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], SettlementInstruction.prototype, "settlementDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], SettlementInstruction.prototype, "debtorName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], SettlementInstruction.prototype, "debtorAccount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], SettlementInstruction.prototype, "creditorName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], SettlementInstruction.prototype, "creditorAccount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 3 }),
    __metadata("design:type", String)
], SettlementInstruction.prototype, "netAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 3 }),
    __metadata("design:type", String)
], SettlementInstruction.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], SettlementInstruction.prototype, "breakdown", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: SettlementStatus, default: SettlementStatus.GENERATED }),
    __metadata("design:type", String)
], SettlementInstruction.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], SettlementInstruction.prototype, "externalReference", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 512, nullable: true }),
    __metadata("design:type", Object)
], SettlementInstruction.prototype, "filePath", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SettlementInstruction.prototype, "createdAt", void 0);
exports.SettlementInstruction = SettlementInstruction = __decorate([
    (0, typeorm_1.Entity)('settlement_instructions'),
    (0, typeorm_1.Index)(['tenantId', 'settlementCycleId']),
    (0, typeorm_1.Index)(['tenantId', 'status'])
], SettlementInstruction);
//# sourceMappingURL=settlement-instruction.entity.js.map