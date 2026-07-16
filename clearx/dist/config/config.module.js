"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantConfigModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const tenant_source_config_schema_1 = require("./schemas/tenant-source-config.schema");
const audit_log_schema_1 = require("./schemas/audit-log.schema");
const config_service_1 = require("./config.service");
const config_controller_1 = require("./config.controller");
let TenantConfigModule = class TenantConfigModule {
};
exports.TenantConfigModule = TenantConfigModule;
exports.TenantConfigModule = TenantConfigModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: tenant_source_config_schema_1.TenantSourceConfig.name, schema: tenant_source_config_schema_1.TenantSourceConfigSchema },
                { name: audit_log_schema_1.AuditLog.name, schema: audit_log_schema_1.AuditLogSchema },
            ]),
        ],
        controllers: [config_controller_1.ConfigController],
        providers: [config_service_1.TenantConfigService],
        exports: [config_service_1.TenantConfigService],
    })
], TenantConfigModule);
//# sourceMappingURL=config.module.js.map