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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const unified_transaction_entity_1 = require("../entities/unified-transaction.entity");
const settlement_instruction_entity_1 = require("../entities/settlement-instruction.entity");
let DashboardService = class DashboardService {
    constructor(transactionRepository, instructionRepository) {
        this.transactionRepository = transactionRepository;
        this.instructionRepository = instructionRepository;
    }
    async getSummary(tenantId) {
        const [total, matched, unmatched, discrepancy] = await Promise.all([
            this.transactionRepository.count({ where: { tenantId } }),
            this.transactionRepository.count({ where: { tenantId, status: unified_transaction_entity_1.TransactionStatus.MATCHED } }),
            this.transactionRepository.count({ where: { tenantId, status: unified_transaction_entity_1.TransactionStatus.UNMATCHED } }),
            this.transactionRepository.count({ where: { tenantId, status: unified_transaction_entity_1.TransactionStatus.DISCREPANCY } }),
        ]);
        const instructions = await this.instructionRepository.find({ where: { tenantId } });
        const netSettlementAmount = instructions
            .reduce((sum, i) => sum + parseFloat(i.netAmount), 0)
            .toFixed(3);
        return {
            totalTransactions: total,
            matchedCount: matched,
            matchedPercentage: total > 0 ? Math.round((matched / total) * 10000) / 100 : 0,
            unmatchedCount: unmatched,
            discrepancyCount: discrepancy,
            netSettlementAmount,
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(unified_transaction_entity_1.UnifiedTransaction)),
    __param(1, (0, typeorm_1.InjectRepository)(settlement_instruction_entity_1.SettlementInstruction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map