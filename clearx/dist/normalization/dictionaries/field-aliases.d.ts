export declare const ESSENTIAL_FIELDS: readonly ["primaryMatchKey", "amount", "currency", "transactionDate", "type"];
export type EssentialField = (typeof ESSENTIAL_FIELDS)[number];
export declare const FIELD_ALIASES: Record<EssentialField, string[]>;
export declare const KNOWN_CURRENCY_CODES: Set<string>;
export declare function normalizeHeader(raw: string): string;
export declare function levenshteinDistance(a: string, b: string): number;
