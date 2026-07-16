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
var ReconciliationResultService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReconciliationResultService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const reconciliation_result_entity_1 = require("../../entities/reconciliation-result.entity");
const unified_transaction_entity_1 = require("../../entities/unified-transaction.entity");
let ReconciliationResultService = ReconciliationResultService_1 = class ReconciliationResultService {
    constructor(resultRepository, dataSource) {
        this.resultRepository = resultRepository;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(ReconciliationResultService_1.name);
    }
    async saveResults(tenantId, classifiedMatches) {
        return this.dataSource.transaction(async (manager) => {
            const resultRepo = manager.getRepository(reconciliation_result_entity_1.ReconciliationResult);
            const txnRepo = manager.getRepository(unified_transaction_entity_1.UnifiedTransaction);
            const results = [];
            for (const match of classifiedMatches) {
                const result = resultRepo.create({
                    tenantId,
                    transactionAId: match.transactionA.id,
                    transactionBId: match.transactionB?.id ?? null,
                    status: match.status,
                    amountDifference: match.amountDifference.toFixed(3),
                    differenceCurrency: match.differenceCurrency,
                    matchedBy: 'SYSTEM',
                    notes: this.buildNotes(match),
                });
                results.push(result);
                const newStatusA = match.status === reconciliation_result_entity_1.ReconciliationStatus.MATCHED
                    ? unified_transaction_entity_1.TransactionStatus.MATCHED
                    : match.status === reconciliation_result_entity_1.ReconciliationStatus.DISCREPANCY_AMOUNT
                        ? unified_transaction_entity_1.TransactionStatus.DISCREPANCY
                        : unified_transaction_entity_1.TransactionStatus.UNMATCHED;
                await txnRepo.update({ id: match.transactionA.id }, { status: newStatusA });
                if (match.transactionB) {
                    const newStatusB = match.status === reconciliation_result_entity_1.ReconciliationStatus.MATCHED
                        ? unified_transaction_entity_1.TransactionStatus.MATCHED
                        : unified_transaction_entity_1.TransactionStatus.DISCREPANCY;
                    await txnRepo.update({ id: match.transactionB.id }, { status: newStatusB });
                }
            }
            const saved = await resultRepo.save(results);
            this.logger.log(`Saved ${saved.length} reconciliation results for tenant ${tenantId}`);
            return saved;
        });
    }
    buildNotes(match) {
        if (match.status === reconciliation_result_entity_1.ReconciliationStatus.DISCREPANCY_MISSING) {
            return match.transactionB
                ? 'Missing counterpart transaction'
                : 'No matching transaction found on the opposite source';
        }
        if (match.status === reconciliation_result_entity_1.ReconciliationStatus.DISCREPANCY_AMOUNT) {
            return `Amount mismatch of ${match.amountDifference} ${match.differenceCurrency ?? ''}`.trim();
        }
        return null;
    }
};
exports.ReconciliationResultService = ReconciliationResultService;
exports.ReconciliationResultService = ReconciliationResultService = ReconciliationResultService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(reconciliation_result_entity_1.ReconciliationResult)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.DataSource])
], ReconciliationResultService);
//# sourceMappingURL=reconciliation-result.service.js.map