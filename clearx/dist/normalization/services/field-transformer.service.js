"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var FieldTransformerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldTransformerService = void 0;
const common_1 = require("@nestjs/common");
let FieldTransformerService = FieldTransformerService_1 = class FieldTransformerService {
    constructor() {
        this.logger = new common_1.Logger(FieldTransformerService_1.name);
    }
    transformRecord(rawRecord, fieldMapping) {
        const result = {};
        for (const [targetField, rule] of Object.entries(fieldMapping)) {
            if (targetField === 'primaryMatchKey')
                continue;
            result[targetField] = this.resolveField(rawRecord, rule);
        }
        return result;
    }
    resolveField(rawRecord, rule) {
        if (!rule)
            return undefined;
        if (rule.strategy === 'conditional' && rule.condition) {
            const sourceValue = rawRecord[rule.condition.field];
            const mapped = rule.condition.mapping[sourceValue];
            return mapped ?? rule.defaultValue;
        }
        if (rule.strategy === 'composite' && rule.fields?.length) {
            const parts = rule.fields.map((f) => rawRecord[f] ?? '').join('');
            return parts || rule.defaultValue;
        }
        if (rule.strategy === 'hierarchical' && rule.fields?.length) {
            for (const f of rule.fields) {
                if (rawRecord[f] !== undefined && rawRecord[f] !== null && rawRecord[f] !== '') {
                    return this.applyTransform(rawRecord[f], rule);
                }
            }
            return rule.defaultValue;
        }
        const rawValue = rule.fieldName ? rawRecord[rule.fieldName] : undefined;
        if (rawValue === undefined || rawValue === null || rawValue === '') {
            return rule.defaultValue;
        }
        if (rule.format) {
            return this.parseDate(rawValue, rule.format);
        }
        return this.applyTransform(rawValue, rule);
    }
    applyTransform(value, rule) {
        if (!rule.transform)
            return value;
        const [op, argRaw] = rule.transform.split(':');
        const arg = argRaw !== undefined ? Number(argRaw) : undefined;
        const numericValue = typeof value === 'number' ? value : parseFloat(value);
        switch (op) {
            case 'divide':
                return arg ? numericValue / arg : numericValue;
            case 'multiply':
                return arg ? numericValue * arg : numericValue;
            case 'trim':
                return typeof value === 'string' ? value.trim() : value;
            case 'uppercase':
                return typeof value === 'string' ? value.toUpperCase() : value;
            case 'lowercase':
                return typeof value === 'string' ? value.toLowerCase() : value;
            default:
                this.logger.warn(`Unknown transform operator: ${op}`);
                return value;
        }
    }
    parseDate(value, format) {
        console.log('parseDate called with value:', value, 'type:', typeof value);
        let numericValue = null;
        if (typeof value === 'number') {
            numericValue = value;
        }
        else if (typeof value === 'string' && !isNaN(Number(value))) {
            numericValue = Number(value);
        }
        if (numericValue !== null) {
            return new Date(Math.round((numericValue - 25569) * 86400 * 1000));
        }
        if (value instanceof Date)
            return value;
        const str = String(value);
        const formatTokens = format.match(/YYYY|MM|DD|HH|mm|ss/g) ?? [];
        const separators = format.split(/YYYY|MM|DD|HH|mm|ss/).filter(Boolean);
        let remaining = str;
        const parts = {};
        for (let i = 0; i < formatTokens.length; i++) {
            const token = formatTokens[i];
            const sepAfter = separators[i] ?? '';
            const endIndex = sepAfter ? remaining.indexOf(sepAfter) : token.length;
            const chunk = endIndex >= 0 ? remaining.slice(0, endIndex === token.length ? token.length : endIndex) : remaining;
            parts[token] = parseInt(chunk, 10);
            remaining = remaining.slice(chunk.length + sepAfter.length);
        }
        const year = parts['YYYY'] ?? new Date().getFullYear();
        const month = (parts['MM'] ?? 1) - 1;
        const day = parts['DD'] ?? 1;
        const hours = parts['HH'] ?? 0;
        const minutes = parts['mm'] ?? 0;
        const seconds = parts['ss'] ?? 0;
        return new Date(year, month, day, hours, minutes, seconds);
    }
};
exports.FieldTransformerService = FieldTransformerService;
exports.FieldTransformerService = FieldTransformerService = FieldTransformerService_1 = __decorate([
    (0, common_1.Injectable)()
], FieldTransformerService);
//# sourceMappingURL=field-transformer.service.js.map