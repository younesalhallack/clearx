import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import {
  ESSENTIAL_FIELDS,
  EssentialField,
  FIELD_ALIASES,
  KNOWN_CURRENCY_CODES,
  levenshteinDistance,
  normalizeHeader,
} from '../dictionaries/field-aliases';

export interface FieldSuggestion {
  targetField: EssentialField;
  matchedColumn: string | null;
  confidence: number; // 0..1
  reason: string;
}

export interface SchemaDetectionResult {
  signature: string;
  headers: string[];
  sampleRows: Record<string, any>[];
  suggestions: FieldSuggestion[];
  /** True only if every essential field found a confident (>=0.35) suggestion. */
  allEssentialFieldsCovered: boolean;
}

const CONFIDENCE_FLOOR = 0.35;
const SAMPLE_SIZE = 25;

/**
 * Infers a candidate field mapping for an uploaded file purely from its
 * column headers and a sample of its data — no tenant-defined mapping
 * required. Used by the "detect" step of the upload flow: the result is
 * always presented to the tenant for confirmation before anything is
 * imported (see NormalizationController#detect / #confirmAndImport), even
 * when confidence is high, because a wrong guess on `amount` or the
 * matching key has real financial consequences.
 */
@Injectable()
export class SchemaDetectionService {
  detect(rawRecords: Record<string, any>[]): SchemaDetectionResult {
    const headers = rawRecords.length > 0 ? Object.keys(rawRecords[0]) : [];
    const sample = rawRecords.slice(0, SAMPLE_SIZE);
    const signature = this.computeSignature(headers);

    const suggestions: FieldSuggestion[] = ESSENTIAL_FIELDS.map((field) =>
      this.suggestColumnForField(field, headers, sample),
    );

    return {
      signature,
      headers,
      sampleRows: rawRecords.slice(0, 10),
      suggestions,
      allEssentialFieldsCovered: suggestions.every((s) => s.matchedColumn !== null),
    };
  }

  /**
   * A signature identifies the "shape" of a file — the set of column
   * names, independent of row order or values — so that a previously
   * confirmed mapping can be recognized and reused automatically on
   * future uploads without asking the tenant again.
   */
  computeSignature(headers: string[]): string {
    const normalized = headers.map((h) => normalizeHeader(h)).sort();
    return crypto.createHash('sha256').update(normalized.join('|')).digest('hex');
  }

  private suggestColumnForField(
    field: EssentialField,
    headers: string[],
    sample: Record<string, any>[],
  ): FieldSuggestion {
    let best: { header: string; score: number; reason: string } | null = null;

    for (const header of headers) {
      const aliasScore = this.aliasScore(field, header);
      const values = sample.map((row) => row[header]);
      const patternScore = this.patternScore(field, values);

      // The matching key leans more on uniqueness of values than on
      // naming, since reference/ID columns are named inconsistently
      // across banks and switches.
      const combined =
        field === 'primaryMatchKey'
          ? 0.4 * aliasScore + 0.6 * patternScore
          : 0.6 * aliasScore + 0.4 * patternScore;

      if (!best || combined > best.score) {
        best = {
          header,
          score: combined,
          reason:
            aliasScore > 0 && patternScore > 0
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

  private aliasScore(field: EssentialField, header: string): number {
    const normalizedHeader = normalizeHeader(header);
    if (!normalizedHeader) return 0;

    const aliases = FIELD_ALIASES[field];
    for (const alias of aliases) {
      if (normalizedHeader === alias) return 1;
    }
    for (const alias of aliases) {
      if (normalizedHeader.includes(alias) || alias.includes(normalizedHeader)) {
        return 0.7;
      }
    }
    // Catch near-miss spellings (small edit distance relative to alias length).
    for (const alias of aliases) {
      const distance = levenshteinDistance(normalizedHeader, alias);
      const tolerance = Math.max(1, Math.floor(alias.length * 0.2));
      if (distance <= tolerance) return 0.5;
    }
    return 0;
  }

  private patternScore(field: EssentialField, values: any[]): number {
    const nonEmpty = values.filter((v) => v !== null && v !== undefined && v !== '');
    if (nonEmpty.length === 0) return 0;

    switch (field) {
      case 'amount':
        return this.fractionMatching(nonEmpty, (v) => this.isNumeric(v));
      case 'currency':
        return this.fractionMatching(nonEmpty, (v) =>
          KNOWN_CURRENCY_CODES.has(String(v).trim().toUpperCase()),
        );
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

  private fractionMatching(values: any[], predicate: (v: any) => boolean): number {
    const matches = values.filter(predicate).length;
    return matches / values.length;
  }

  private isNumeric(value: any): boolean {
    if (typeof value === 'number') return true;
    const cleaned = String(value).replace(/,/g, '').trim();
    return cleaned.length > 0 && !Number.isNaN(Number(cleaned));
  }

  private looksLikeDate(value: any): boolean {
    if (value instanceof Date) return true;
    const str = String(value).trim();
    const patterns = [
      /^\d{4}-\d{1,2}-\d{1,2}([ T]\d{1,2}:\d{2}(:\d{2})?)?$/, // ISO-ish
      /^\d{1,2}\/\d{1,2}\/\d{2,4}(\s+\d{1,2}:\d{2}(:\d{2})?)?$/, // DD/MM/YYYY
      /^\d{1,2}-\d{1,2}-\d{2,4}(\s+\d{1,2}:\d{2}(:\d{2})?)?$/, // DD-MM-YYYY
    ];
    return patterns.some((p) => p.test(str));
  }

  /**
   * A `type` column is typically a small, repeated set of category
   * values (e.g. CREDIT/DEBIT, C/D) rather than free text — this checks
   * for that shape (few distinct values relative to sample size).
   */
  private smallDistinctSetScore(values: any[]): number {
    const distinct = new Set(values.map((v) => String(v).trim().toUpperCase()));
    if (distinct.size <= 1) return 0.2; // constant column — weak signal alone
    if (distinct.size <= 4) return 0.8;
    if (distinct.size <= 8) return 0.4;
    return 0;
  }

  private uniquenessRatio(values: any[]): number {
    const distinct = new Set(values.map((v) => String(v).trim()));
    return distinct.size / values.length;
  }
}
