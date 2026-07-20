"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaDetectionService = void 0;
const common_1 = require("@nestjs/common");
const crypto = require("crypto");
const field_aliases_1 = require("../dictionaries/field-aliases");
const CONFIDENCE_FLOOR = 0.35;
const SAMPLE_SIZE = 25;
let SchemaDetectionService = class SchemaDetectionService {
    detect(rawRecords) {
        const headers = rawRecords.length > 0 ? Object.keys(rawRecords[0]) : [];
        const sample = rawRecords.slice(0, SAMPLE_SIZE);
        const signature = this.computeSignature(headers);
        const suggestions = field_aliases_1.ESSENTIAL_FIELDS.map((field) => this.suggestColumnForField(field, headers, sample));
        return {
            signature,
            headers,
            sampleRows: rawRecords.slice(0, 10),
            suggestions,
            allEssentialFieldsCovered: suggestions.every((s) => s.matchedColumn !== null),
        };
    }
    computeSignature(headers) {
        const normalized = headers.map((h) => (0, field_aliases_1.normalizeHeader)(h)).sort();
        return crypto.createHash('sha256').update(normalized.join('|')).digest('hex');
    }
    suggestColumnForField(field, headers, sample) {
        let best = null;
        for (const header of headers) {
            const aliasScore = this.aliasScore(field, header);
            const values = sample.map((row) => row[header]);
            const patternScore = this.patternScore(field, values);
            const combined = field === 'primaryMatchKey'
                ? 0.4 * aliasScore + 0.6 * patternScore
                : 0.6 * aliasScore + 0.4 * patternScore;
            if (!best || combined > best.score) {
                best = {
                    header,
                    score: combined,
                    reason: aliasScore > 0 && patternScore > 0
                        ? 'column name and data pattern both matched'
                        : aliasScore > 0
                            ? 'column name matched a known alias'
                            : patternScore > 0
                                ? 'data pattern matched'
                                : 'weak or no match',
                };
            }
        }
        if (!best || best.score < CONFIDENCE_FLOOR) {
            return {
                targetField: field,
                matchedColumn: null,
                confidence: best?.score ?? 0,
                reason: 'no confident match found — needs manual selection',
            };
        }
        return {
            targetField: field,
            matchedColumn: best.header,
            confidence: Math.min(1, Math.round(best.score * 100) / 100),
            reason: best.reason,
        };
    }
    aliasScore(field, header) {
        const normalizedHeader = (0, field_aliases_1.normalizeHeader)(header);
        if (!normalizedHeader)
            return 0;
        const aliases = field_aliases_1.FIELD_ALIASES[field];
        for (const alias of aliases) {
            if (normalizedHeader === alias)
                return 1;
        }
        for (const alias of aliases) {
            if (normalizedHeader.includes(alias) || alias.includes(normalizedHeader)) {
                return 0.7;
            }
        }
        for (const alias of aliases) {
            const distance = (0, field_aliases_1.levenshteinDistance)(normalizedHeader, alias);
            const tolerance = Math.max(1, Math.floor(alias.length * 0.2));
            if (distance <= tolerance)
                return 0.5;
        }
        return 0;
    }
    patternScore(field, values) {
        const nonEmpty = values.filter((v) => v !== null && v !== undefined && v !== '');
        if (nonEmpty.length === 0)
            return 0;
        switch (field) {
            case 'amount':
                return this.fractionMatching(nonEmpty, (v) => this.isNumeric(v));
            case 'currency':
                return this.fractionMatching(nonEmpty, (v) => field_aliases_1.KNOWN_CURRENCY_CODES.has(String(v).trim().toUpperCase()));
            case 'transactionDate':
                return this.fractionMatching(nonEmpty, (v) => this.looksLikeDate(v));
            case 'type':
                return this.smallDistinctSetScore(nonEmpty);
            case 'primaryMatchKey':
                return this.uniquenessRatio(nonEmpty);
            default:
                return 0;
        }
    }
    fractionMatching(values, predicate) {
        const matches = values.filter(predicate).length;
        return matches / values.length;
    }
    isNumeric(value) {
        if (typeof value === 'number')
            return true;
        const cleaned = String(value).replace(/,/g, '').trim();
        return cleaned.length > 0 && !Number.isNaN(Number(cleaned));
    }
    looksLikeDate(value) {
        if (value instanceof Date)
            return true;
        const str = String(value).trim();
        const patterns = [
            /^\d{4}-\d{1,2}-\d{1,2}([ T]\d{1,2}:\d{2}(:\d{2})?)?$/,
            /^\d{1,2}\/\d{1,2}\/\d{2,4}(\s+\d{1,2}:\d{2}(:\d{2})?)?$/,
            /^\d{1,2}-\d{1,2}-\d{2,4}(\s+\d{1,2}:\d{2}(:\d{2})?)?$/,
        ];
        return patterns.some((p) => p.test(str));
    }
    smallDistinctSetScore(values) {
        const distinct = new Set(values.map((v) => String(v).trim().toUpperCase()));
        if (distinct.size <= 1)
            return 0.2;
        if (distinct.size <= 4)
            return 0.8;
        if (distinct.size <= 8)
            return 0.4;
        return 0;
    }
    uniquenessRatio(values) {
        const distinct = new Set(values.map((v) => String(v).trim()));
        return distinct.size / values.length;
    }
};
exports.SchemaDetectionService = SchemaDetectionService;
exports.SchemaDetectionService = SchemaDetectionService = __decorate([
    (0, common_1.Injectable)()
], SchemaDetectionService);
//# sourceMappingURL=schema-detection.service.js.map