export interface FieldMappingRule {
    strategy?: 'single_field' | 'composite' | 'hierarchical' | 'conditional';
    fieldName?: string;
    transform?: string;
    defaultValue?: any;
    format?: string;
    fields?: string[];
    condition?: {
        field: string;
        mapping: Record<string, string>;
    };
}
export type FieldMapping = Record<string, FieldMappingRule>;
export declare class FieldTransformerService {
    private readonly logger;
    transformRecord(rawRecord: Record<string, any>, fieldMapping: FieldMapping): Record<string, any>;
    resolveField(rawRecord: Record<string, any>, rule: FieldMappingRule): any;
    private applyTransform;
    private parseDate;
}
