import { Injectable, Logger } from '@nestjs/common';

export interface FieldMappingRule {
  strategy?: 'single_field' | 'composite' | 'hierarchical' | 'conditional';
  fieldName?: string;
  transform?: string; // e.g. 'divide:100', 'multiply:1', 'trim', 'uppercase'
  defaultValue?: any;
  format?: string; // date format, e.g. 'DD/MM/YYYY HH:mm:ss'
  fields?: string[]; // for composite/hierarchical
  condition?: {
    field: string;
    mapping: Record<string, string>;
  };
}

export type FieldMapping = Record<string, FieldMappingRule>;

/**
 * Applies a tenant's configured field mapping to a raw record, producing
 * a partial UnifiedTransaction-shaped object. Handles simple field copies,
 * numeric transforms, conditional mapping, and date parsing.
 */
@Injectable()
export class FieldTransformerService {
  private readonly logger = new Logger(FieldTransformerService.name);

  transformRecord(
    rawRecord: Record<string, any>,
    fieldMapping: FieldMapping,
  ): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [targetField, rule] of Object.entries(fieldMapping)) {
      // primaryMatchKey is resolved separately by MatchKeyResolverService.
      if (targetField === 'primaryMatchKey') continue;
      result[targetField] = this.resolveField(rawRecord, rule);
    }

    return result;
  }

  resolveField(rawRecord: Record<string, any>, rule: FieldMappingRule): any {
    if (!rule) return undefined;

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

    // Default: single_field (or unspecified strategy).
    const rawValue = rule.fieldName ? rawRecord[rule.fieldName] : undefined;
    if (rawValue === undefined || rawValue === null || rawValue === '') {
      return rule.defaultValue;
    }

    if (rule.format) {
      return this.parseDate(rawValue, rule.format);
    }

    return this.applyTransform(rawValue, rule);
  }

  private applyTransform(value: any, rule: FieldMappingRule): any {
    if (!rule.transform) return value;

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

  /**
   * Parses a date string according to a simple DD/MM/YYYY-style format
   * token. For production use, consider swapping in a robust library
   * (e.g. date-fns / dayjs with custom-parse-format) behind this method.
   */
  // private parseDate(value: any, format: string): Date {
  //   if (value instanceof Date) return value;

  //   if (typeof value === 'number') {
  //     // Excel serial date fallback.
  //     return new Date(Math.round((value - 25569) * 86400 * 1000));
  //   }

  //   const str = String(value);
  //   const formatTokens = format.match(/YYYY|MM|DD|HH|mm|ss/g) ?? [];
  //   const separators = format.split(/YYYY|MM|DD|HH|mm|ss/).filter(Boolean);

  //   let cursor = 0;
  //   const parts: Record<string, number> = {};
  //   let remaining = str;

  //   for (let i = 0; i < formatTokens.length; i++) {
  //     const token = formatTokens[i];
  //     const sepAfter = separators[i] ?? '';
  //     const endIndex = sepAfter ? remaining.indexOf(sepAfter) : token.length;
  //     const chunk = endIndex >= 0 ? remaining.slice(0, endIndex === token.length ? token.length : endIndex) : remaining;
  //     parts[token] = parseInt(chunk, 10);
  //     remaining = remaining.slice(chunk.length + sepAfter.length);
  //     cursor += chunk.length + sepAfter.length;
  //   }

  //   const year = parts['YYYY'] ?? new Date().getFullYear();
  //   const month = (parts['MM'] ?? 1) - 1;
  //   const day = parts['DD'] ?? 1;
  //   const hours = parts['HH'] ?? 0;
  //   const minutes = parts['mm'] ?? 0;
  //   const seconds = parts['ss'] ?? 0;

  //   return new Date(year, month, day, hours, minutes, seconds);
  // }
  private parseDate(value: any, format: string): Date {

    console.log('parseDate called with value:', value, 'type:', typeof value);

  // 1️⃣ التعامل مع الأرقام (صحيحة أو عشرية) كتاريخ Excel تسلسلي
  let numericValue: number | null = null;
  if (typeof value === 'number') {
    numericValue = value;
  } else if (typeof value === 'string' && !isNaN(Number(value))) {
    numericValue = Number(value);
  }

  if (numericValue !== null) {
    // تحويل تاريخ Excel التسلسلي (مع الوقت) إلى كائن Date
    // 25569 = الفرق بين 1900-01-01 و 1970-01-01 بالأيام
    // 86400 = عدد الثواني في اليوم
    return new Date(Math.round((numericValue - 25569) * 86400 * 1000));
  }

  // 2️⃣ إذا كانت القيمة من نوع Date بالفعل
  if (value instanceof Date) return value;

  // 3️⃣ التعامل مع التواريخ النصية بالتنسيق المحدد (كما في الكود الأصلي)
  const str = String(value);
  const formatTokens = format.match(/YYYY|MM|DD|HH|mm|ss/g) ?? [];
  const separators = format.split(/YYYY|MM|DD|HH|mm|ss/).filter(Boolean);

  let remaining = str;
  const parts: Record<string, number> = {};

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
}
