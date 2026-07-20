"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NormalizationModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const platform_express_1 = require("@nestjs/platform-express");
const unified_transaction_entity_1 = require("../entities/unified-transaction.entity");
const config_module_1 = require("../config/config.module");
const file_parser_service_1 = require("./services/file-parser.service");
const field_transformer_service_1 = require("./services/field-transformer.service");
const match_key_resolver_service_1 = require("./services/match-key-resolver.service");
const schema_detection_service_1 = require("./services/schema-detection.service");
const normalization_service_1 = require("./services/normalization.service");
const normalization_controller_1 = require("./normalization.controller");
let NormalizationModule = class NormalizationModule {
};
exports.NormalizationModule = NormalizationModule;
exports.NormalizationModule = NormalizationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([unified_transaction_entity_1.UnifiedTransaction]),
            config_module_1.TenantConfigModule,
            platform_express_1.MulterModule.register({ dest: '/tmp/clearx-uploads' }),
        ],
        controllers: [normalization_controller_1.NormalizationController],
        providers: [
            file_parser_service_1.FileParserService,
            field_transformer_service_1.FieldTransformerService,
            match_key_resolver_service_1.MatchKeyResolverService,
            schema_detection_service_1.SchemaDetectionService,
            normalization_service_1.NormalizationService,
        ],
        exports: [normalization_service_1.NormalizationService],
    })
], NormalizationModule);
//# sourceMappingURL=normalization.module.js.map