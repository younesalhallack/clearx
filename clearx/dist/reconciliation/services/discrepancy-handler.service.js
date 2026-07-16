"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscrepancyHandlerService = void 0;
const common_1 = require("@nestjs/common");
const reconciliation_result_entity_1 = require("../../entities/reconciliation-result.entity");
const AMOUNT_TOLERANCE = 0.0001;
let DiscrepancyHandlerService = class DiscrepancyHandlerService {
    classify(pair) {
        const { transactionA, transactionB } = pair;
        if (!transactionB) {
            return {
                transactionA,
                transactionB: null,
                status: reconciliation_result_entity_1.ReconciliationStatus.DISCREPANCY_MISSING,
                amountDifference: parseFloat(transactionA.amount),
                differenceCurrency: transactionA.currency,
            };
        }
        const amountA = parseFloat(transactionA.amount);
        const amountB = parseFloat(transactionB.amount);
        const difference = Math.round((amountA - amountB) * 1000) / 1000;
        if (Math.abs(difference) > AMOUNT_TOLERANCE) {
            return {
                transactionA,
                transactionB,
                status: reconciliation_result_entity_1.ReconciliationStatus.DISCREPANCY_AMOUNT,
                amountDifference: difference,
                differenceCurrency: transactionA.currency,
            };
        }
        return {
            transactionA,
            transactionB,
            status: reconciliation_result_entity_1.ReconciliationStatus.MATCHED,
            amountDifference: 0,
            differenceCurrency: null,
        };
    }
    classifyMissingInA(transactionB) {
        return {
            transactionA: transactionB,
            transactionB: null,
            status: reconciliation_result_entity_1.ReconciliationStatus.DISCREPANCY_MISSING,
            amountDifference: parseFloat(transactionB.amount),
            differenceCurrency: transactionB.currency,
        };
    }
};
exports.DiscrepancyHandlerService = DiscrepancyHandlerService;
exports.DiscrepancyHandlerService = DiscrepancyHandlerService = __decorate([
    (0, common_1.Injectable)()
], DiscrepancyHandlerService);
//# sourceMappingURL=discrepancy-handler.service.js.map