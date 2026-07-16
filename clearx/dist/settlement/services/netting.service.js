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
var NettingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NettingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const uuid_1 = require("uuid");
const reconciliation_result_entity_1 = require("../../entities/reconciliation-result.entity");
const settlement_instruction_entity_1 = require("../../entities/settlement-instruction.entity");
let NettingService = NettingService_1 = class NettingService {
    constructor(resultRepository, instructionRepository) {
        this.resultRepository = resultRepository;
        this.instructionRepository = instructionRepository;
        this.logger = new common_1.Logger(NettingService_1.name);
    }
    async generateInstructionsForCycle(tenantId, reconciliationResultIds) {
        const results = reconciliationResultIds.length
            ? await this.resultRepository.find({
                where: reconciliationResultIds.map((id) => ({ id, tenantId })),
            })
            : await this.resultRepository.find({ where: { tenantId } });
        const matched = results.filter((r) => r.status === reconciliation_result_entity_1.ReconciliationStatus.MATCHED);
        if (matched.length === 0) {
            this.logger.warn(`No matched results to settle for tenant ${tenantId}`);
            return [];
        }
        const totalsByCurrency = new Map();
        const cycleId = (0, uuid_1.v4)();
        const instructions = [];
        for (const [currency, netAmount] of totalsByCurrency.entries()) {
            instructions.push(this.instructionRepository.create({
                tenantId,
                settlementCycleId: cycleId,
                settlementDate: new Date().toISOString().slice(0, 10),
                debtorName: 'TBD',
                debtorAccount: 'TBD',
                creditorName: 'TBD',
                creditorAccount: 'TBD',
                netAmount: netAmount.toFixed(3),
                currency,
                breakdown: JSON.stringify({ resultIds: reconciliationResultIds }),
                status: settlement_instruction_entity_1.SettlementStatus.GENERATED,
            }));
        }
        if (instructions.length === 0)
            return [];
        return this.instructionRepository.save(instructions);
    }
};
exports.NettingService = NettingService;
exports.NettingService = NettingService = NettingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(reconciliation_result_entity_1.ReconciliationResult)),
    __param(1, (0, typeorm_1.InjectRepository)(settlement_instruction_entity_1.SettlementInstruction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], NettingService);
//# sourceMappingURL=netting.service.js.map