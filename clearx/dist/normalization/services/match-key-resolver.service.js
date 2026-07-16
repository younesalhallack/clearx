"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MatchKeyResolverService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchKeyResolverService = void 0;
const common_1 = require("@nestjs/common");
let MatchKeyResolverService = MatchKeyResolverService_1 = class MatchKeyResolverService {
    constructor() {
        this.logger = new common_1.Logger(MatchKeyResolverService_1.name);
    }
    resolve(rawRecord, rule) {
        if (!rule) {
            this.logger.warn('No primaryMatchKey rule configured; falling back to empty key');
            return '';
        }
        switch (rule.strategy) {
            case 'composite':
                return (rule.fields ?? [])
                    .map((f) => (rawRecord[f] ?? '').toString().trim())
                    .join('|');
            case 'hierarchical':
                for (const f of rule.fields ?? []) {
                    const value = rawRecord[f];
                    if (value !== undefined && value !== null && value !== '') {
                        return value.toString().trim();
                    }
                }
                return '';
            case 'single_field':
            default:
                const value = rule.fieldName ? rawRecord[rule.fieldName] : undefined;
                return value !== undefined && value !== null ? value.toString().trim() : '';
        }
    }
};
exports.MatchKeyResolverService = MatchKeyResolverService;
exports.MatchKeyResolverService = MatchKeyResolverService = MatchKeyResolverService_1 = __decorate([
    (0, common_1.Injectable)()
], MatchKeyResolverService);
//# sourceMappingURL=match-key-resolver.service.js.map