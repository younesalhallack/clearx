"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const mongoose_1 = require("@nestjs/mongoose");
const tenant_entity_1 = require("./entities/tenant.entity");
const unified_transaction_entity_1 = require("./entities/unified-transaction.entity");
const reconciliation_result_entity_1 = require("./entities/reconciliation-result.entity");
const settlement_instruction_entity_1 = require("./entities/settlement-instruction.entity");
const auth_module_1 = require("./auth/auth.module");
const tenant_module_1 = require("./tenants/tenant.module");
const config_module_1 = require("./config/config.module");
const normalization_module_1 = require("./normalization/normalization.module");
const reconciliation_module_1 = require("./reconciliation/reconciliation.module");
const settlement_module_1 = require("./settlement/settlement.module");
const transactions_module_1 = require("./transactions/transactions.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    type: configService.get('DB_TYPE', 'mysql'),
                    host: configService.get('DB_HOST', 'localhost'),
                    port: configService.get('DB_PORT', 3306),
                    username: configService.get('DB_USERNAME', 'clearx'),
                    password: configService.get('DB_PASSWORD', 'clearx'),
                    database: configService.get('DB_DATABASE', 'clearx'),
                    entities: [tenant_entity_1.Tenant, unified_transaction_entity_1.UnifiedTransaction, reconciliation_result_entity_1.ReconciliationResult, settlement_instruction_entity_1.SettlementInstruction],
                    synchronize: configService.get('DB_SYNCHRONIZE', 'false') === 'true',
                    logging: configService.get('DB_LOGGING', 'false') === 'true',
                }),
            }),
            mongoose_1.MongooseModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    uri: configService.get('MONGO_URI', 'mongodb://localhost:27017/clearx_config'),
                }),
            }),
            auth_module_1.AuthModule,
            tenant_module_1.TenantModule,
            config_module_1.TenantConfigModule,
            normalization_module_1.NormalizationModule,
            reconciliation_module_1.ReconciliationModule,
            settlement_module_1.SettlementModule,
            transactions_module_1.TransactionsModule,
            dashboard_module_1.DashboardModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map