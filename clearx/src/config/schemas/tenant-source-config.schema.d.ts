import { Document } from 'mongoose';
export type TenantSourceConfigDocument = TenantSourceConfig & Document;
declare class FieldMappingRule {
    strategy?: string;
    fieldName?: string;
    transform?: string;
    defaultValue?: string;
    format?: string;
    fields?: string[];
    condition?: {
        field: string;
        mapping: Record<string, string>;
    };
}
declare class FileFormat {
    type: string;
    delimiter: string;
    encoding: string;
    hasHeader: boolean;
    skipRows: number;
}
declare class ValidationRules {
    minAmount?: number;
    maxAmount?: number;
    requiredFields: string[];
}
export declare class TenantSourceConfig {
    tenantId: string;
    sourceId: string;
    sourceName: string;
    paymentMethod: string;
    fileFormat: FileFormat;
    fieldMapping: Record<string, FieldMappingRule>;
    validationRules: ValidationRules;
}
export declare const TenantSourceConfigSchema: import("mongoose").Schema<TenantSourceConfig, import("mongoose").Model<TenantSourceConfig, any, any, any, Document<unknown, any, TenantSourceConfig, any, {}> & TenantSourceConfig & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, TenantSourceConfig, Document<unknown, {}, import("mongoose").FlatRecord<TenantSourceConfig>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<TenantSourceConfig> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export {};
