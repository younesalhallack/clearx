"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettlementModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const reconciliation_result_entity_1 = require("../entities/reconciliation-result.entity");
const settlement_instruction_entity_1 = require("../entities/settlement-instruction.entity");
const netting_service_1 = require("./services/netting.service");
let SettlementModule = class SettlementModule {
};
exports.SettlementModule = SettlementModule;
exports.SettlementModule = SettlementModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([reconciliation_result_entity_1.ReconciliationResult, settlement_instruction_entity_1.SettlementInstruction])],
        providers: [netting_service_1.NettingService],
        exports: [netting_service_1.NettingService],
    })
], SettlementModule);
//# sourceMappingURL=settlement.module.js.map