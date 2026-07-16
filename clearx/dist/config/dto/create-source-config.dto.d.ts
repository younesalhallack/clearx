declare class FileFormatDto {
    type: string;
    delimiter?: string;
    encoding?: string;
    hasHeader?: boolean;
    skipRows?: number;
}
export declare class CreateSourceConfigDto {
    sourceId: string;
    sourceName: string;
    paymentMethod: string;
    fileFormat: FileFormatDto;
    fieldMapping: Record<string, any>;
    validationRules?: Record<string, any>;
}
export {};
