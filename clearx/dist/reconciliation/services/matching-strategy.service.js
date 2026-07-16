"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MatchingStrategyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchingStrategyService = void 0;
const common_1 = require("@nestjs/common");
let MatchingStrategyService = MatchingStrategyService_1 = class MatchingStrategyService {
    constructor() {
        this.logger = new common_1.Logger(MatchingStrategyService_1.name);
    }
    exactMatch1to1(sourceA, sourceB) {
        const bByKey = new Map();
        for (const txn of sourceB) {
            const bucket = bByKey.get(txn.primaryMatchKey) ?? [];
            bucket.push(txn);
            bByKey.set(txn.primaryMatchKey, bucket);
        }
        const pairs = [];
        const consumedBIds = new Set();
        for (const txnA of sourceA) {
            const candidates = bByKey.get(txnA.primaryMatchKey) ?? [];
            const candidate = candidates.find((c) => !consumedBIds.has(c.id));
            if (candidate) {
                consumedBIds.add(candidate.id);
                pairs.push({ transactionA: txnA, transactionB: candidate });
            }
            else {
                pairs.push({ transactionA: txnA, transactionB: null });
            }
        }
        const unmatchedB = sourceB.filter((txn) => !consumedBIds.has(txn.id));
        this.logger.log(`exactMatch1to1: ${pairs.length} A-side records processed, ${unmatchedB.length} unmatched B-side records`);
        return { pairs, unmatchedB };
    }
    aggregateMatch(_sourceA, _sourceB) {
        throw new Error('aggregateMatch strategy is not yet implemented');
    }
    fuzzyMatch(_sourceA, _sourceB, _toleranceOptions) {
        throw new Error('fuzzyMatch strategy is not yet implemented');
    }
};
exports.MatchingStrategyService = MatchingStrategyService;
exports.MatchingStrategyService = MatchingStrategyService = MatchingStrategyService_1 = __decorate([
    (0, common_1.Injectable)()
], MatchingStrategyService);
//# sourceMappingURL=matching-strategy.service.js.map