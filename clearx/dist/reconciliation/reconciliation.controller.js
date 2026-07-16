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
exports.ReconciliationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const reconciliation_service_1 = require("./services/reconciliation.service");
const run_reconciliation_dto_1 = require("./dto/run-reconciliation.dto");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const reconciliation_result_entity_1 = require("../entities/reconciliation-result.entity");
let ReconciliationController = class ReconciliationController {
    constructor(reconciliationService, resultRepository) {
        this.reconciliationService = reconciliationService;
        this.resultRepository = resultRepository;
    }
    async run(req, dto) {
        const tenantId = req.user.tenantId;
        return this.reconciliationService.runCycle({
            tenantId,
            sourceA: dto.sourceA,
            sourceB: dto.sourceB,
        });
    }
    async findResults(req, status) {
        const tenantId = req.user.tenantId;
        const where = { tenantId };
        if (status)
            where.status = status;
        return this.resultRepository.find({ where, order: { createdAt: 'DESC' } });
    }
};
exports.ReconciliationController = ReconciliationController;
__decorate([
    (0, common_1.Post)('reconciliation/run'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, run_reconciliation_dto_1.RunReconciliationDto]),
    __metadata("design:returntype", Promise)
], ReconciliationController.prototype, "run", null);
__decorate([
    (0, common_1.Get)('reconciliation-results'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ReconciliationController.prototype, "findResults", null);
exports.ReconciliationController = ReconciliationController = __decorate([
    (0, swagger_1.ApiTags)('reconciliation'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)(),
    __param(1, (0, typeorm_1.InjectRepository)(reconciliation_result_entity_1.ReconciliationResult)),
    __metadata("design:paramtypes", [reconciliation_service_1.ReconciliationService,
        typeorm_2.Repository])
], ReconciliationController);
//# sourceMappingURL=reconciliation.controller.js.map