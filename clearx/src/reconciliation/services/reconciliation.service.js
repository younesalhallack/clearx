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
var ReconciliationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReconciliationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const uuid_1 = require("uuid");
const unified_transaction_entity_1 = require("../../entities/unified-transaction.entity");
const matching_strategy_service_1 = require("./matching-strategy.service");
const discrepancy_handler_service_1 = require("./discrepancy-handler.service");
const reconciliation_result_service_1 = require("./reconciliation-result.service");
let ReconciliationService = ReconciliationService_1 = class ReconciliationService {
    constructor(transactionRepository, matchingStrategyService, discrepancyHandlerService, reconciliationResultService) {
        this.transactionRepository = transactionRepository;
        this.matchingStrategyService = matchingStrategyService;
        this.discrepancyHandlerService = discrepancyHandlerService;
        this.reconciliationResultService = reconciliationResultService;
        this.logger = new common_1.Logger(ReconciliationService_1.name);
    }
    async runCycle(params) {
        const { tenantId, sourceA, sourceB } = params;
        const cycleId = (0, uuid_1.v4)();
        const [txnsA, txnsB] = await Promise.all([
            this.transactionRepository.find({
                where: { tenantId, source: sourceA, status: unified_transaction_entity_1.TransactionStatus.PENDING },
            }),
            this.transactionRepository.find({
                where: { tenantId, source: sourceB, status: unified_transaction_entity_1.TransactionStatus.PENDING },
            }),
        ]);
        const { pairs, unmatchedB } = this.matchingStrategyService.exactMatch1to1(txnsA, txnsB);
        const classifiedMatches = pairs.map((pair) => this.discrepancyHandlerService.classify(pair));
        const classifiedMissingB = unmatchedB.map((txn) => this.discrepancyHandlerService.classifyMissingInA(txn));
        const allClassified = [...classifiedMatches, ...classifiedMissingB];
        await this.reconciliationResultService.saveResults(tenantId, allClassified);
        const summary = {
            cycleId,
            totalA: txnsA.length,
            totalB: txnsB.length,
            matched: allClassified.filter((m) => m.status === 'MATCHED').length,
            discrepancyAmount: allClassified.filter((m) => m.status === 'DISCREPANCY_AMOUNT').length,
            discrepancyMissing: allClassified.filter((m) => m.status === 'DISCREPANCY_MISSING').length,
        };
        this.logger.log(`Reconciliation cycle ${cycleId} complete for tenant ${tenantId}: ${JSON.stringify(summary)}`);
        return summary;
    }
};
exports.ReconciliationService = ReconciliationService;
exports.ReconciliationService = ReconciliationService = ReconciliationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(unified_transaction_entity_1.UnifiedTransaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        matching_strategy_service_1.MatchingStrategyService,
        discrepancy_handler_service_1.DiscrepancyHandlerService,
        reconciliation_result_service_1.ReconciliationResultService])
], ReconciliationService);
//# sourceMappingURL=reconciliation.service.js.map