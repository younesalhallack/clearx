import { EssentialField } from '../dictionaries/field-aliases';
export interface FieldSuggestion {
    targetField: EssentialField;
    matchedColumn: string | null;
    confidence: number;
    reason: string;
}
export interface SchemaDetectionResult {
    signature: string;
    headers: string[];
    sampleRows: Record<string, any>[];
    suggestions: FieldSuggestion[];
    allEssentialFieldsCovered: boolean;
}
export declare class SchemaDetectionService {
    detect(rawRecords: Record<string, any>[]): SchemaDetectionResult;
    computeSignature(headers: string[]): string;
    private suggestColumnForField;
    private aliasScore;
    private patternScore;
    private fractionMatching;
    private isNumeric;
    private looksLikeDate;
    private smallDistinctSetScore;
    private uniquenessRatio;
}
