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
exports.NormalizationController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const normalization_service_1 = require("./services/normalization.service");
const config_service_1 = require("../config/config.service");
let NormalizationController = class NormalizationController {
    constructor(normalizationService, tenantConfigService) {
        this.normalizationService = normalizationService;
        this.tenantConfigService = tenantConfigService;
    }
    async upload(req, file, sourceId) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        if (!sourceId) {
            throw new common_1.BadRequestException('sourceId query parameter is required');
        }
        const tenantId = req.user.tenantId;
        const sourceConfig = await this.tenantConfigService.findSourceConfig(tenantId, sourceId);
        const summary = await this.normalizationService.normalizeAndSave(tenantId, sourceConfig, file.path, file.originalname);
        await this.tenantConfigService.recordAudit(tenantId, 'NORMALIZATION_RUN', 'UnifiedTransaction', undefined, {
            sourceId,
            fileName: file.originalname,
            ...summary,
        });
        return summary;
    }
};
exports.NormalizationController = NormalizationController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Query)('sourceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], NormalizationController.prototype, "upload", null);
exports.NormalizationController = NormalizationController = __decorate([
    (0, swagger_1.ApiTags)('normalization'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('normalization'),
    __metadata("design:paramtypes", [normalization_service_1.NormalizationService,
        config_service_1.TenantConfigService])
], NormalizationController);
//# sourceMappingURL=normalization.controller.js.map