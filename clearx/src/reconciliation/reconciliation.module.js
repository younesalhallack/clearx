"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReconciliationModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const unified_transaction_entity_1 = require("../entities/unified-transaction.entity");
const reconciliation_result_entity_1 = require("../entities/reconciliation-result.entity");
const matching_strategy_service_1 = require("./services/matching-strategy.service");
const discrepancy_handler_service_1 = require("./services/discrepancy-handler.service");
const reconciliation_result_service_1 = require("./services/reconciliation-result.service");
const reconciliation_service_1 = require("./services/reconciliation.service");
const reconciliation_controller_1 = require("./reconciliation.controller");
let ReconciliationModule = class ReconciliationModule {
};
exports.ReconciliationModule = ReconciliationModule;
exports.ReconciliationModule = ReconciliationModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([unified_transaction_entity_1.UnifiedTransaction, reconciliation_result_entity_1.ReconciliationResult])],
        controllers: [reconciliation_controller_1.ReconciliationController],
        providers: [
            matching_strategy_service_1.MatchingStrategyService,
            discrepancy_handler_service_1.DiscrepancyHandlerService,
            reconciliation_result_service_1.ReconciliationResultService,
            reconciliation_service_1.ReconciliationService,
        ],
        exports: [reconciliation_service_1.ReconciliationService],
    })
], ReconciliationModule);
//# sourceMappingURL=reconciliation.module.js.map