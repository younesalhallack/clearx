import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TenantSourceConfigDocument = TenantSourceConfig & Document;

/**
 * Describes how to interpret a field on the field mapping. Strategy-based
 * shape lets a single field definition express a direct copy, a
 * transformation, or a conditional/derived value.
 */
@Schema({ _id: false })
class FieldMappingRule {
  @Prop()
  strategy?: string; // e.g. 'single_field' | 'composite' | 'hierarchical' | 'conditional'

  @Prop()
  fieldName?: string;

  @Prop()
  transform?: string; // e.g. 'divide:100', 'multiply:1'

  @Prop()
  defaultValue?: string;

  @Prop()
  format?: string; // date format string, e.g. 'DD/MM/YYYY HH:mm:ss'

  @Prop({ type: [String] })
  fields?: string[]; // used for composite/hierarchical strategies

  @Prop({ type: Object })
  condition?: {
    field: string;
    mapping: Record<string, string>;
  };
}

@Schema({ _id: false })
class FileFormat {
  @Prop({ required: true })
  type: string; // csv | xlsx | json

  @Prop({ default: ',' })
  delimiter: string;

  @Prop({ default: 'utf-8' })
  encoding: string;

  @Prop({ default: true })
  hasHeader: boolean;

  @Prop({ default: 0 })
  skipRows: number;
}

@Schema({ _id: false })
class ValidationRules {
  @Prop()
  minAmount?: number;

  @Prop()
  maxAmount?: number;

  @Prop({ type: [String], default: [] })
  requiredFields: string[];
}

@Schema({ collection: 'tenant_source_configs', timestamps: true })
export class TenantSourceConfig {
  @Prop({ required: true, index: true })
  tenantId: string;

  @Prop({ required: true })
  sourceId: string;

  @Prop({ required: true })
  sourceName: string;

  @Prop({ required: true })
  paymentMethod: string;

  @Prop({ type: FileFormat, required: true })
  fileFormat: FileFormat;

  /**
   * Keyed by target UnifiedTransaction field name
   * (e.g. "primaryMatchKey", "amount", "currency", "type", ...).
   */
  @Prop({ type: Object, required: true })
  fieldMapping: Record<string, FieldMappingRule>;

  @Prop({ type: ValidationRules, default: {} })
  validationRules: ValidationRules;

  /**
   * Hash of this source's normalized column headers (see
   * SchemaDetectionService#computeSignature). Lets the upload flow
   * recognize "we've seen this exact file shape before" and reuse this
   * config automatically without asking the tenant to reconfirm.
   * Absent for configs created before auto-detection existed, or created
   * manually without going through the detect/confirm flow.
   */
  @Prop({ index: true })
  columnSignature?: string;

  /**
   * True once a human has explicitly reviewed and approved this mapping
   * (via POST /normalization/confirm-and-import, or the manual creation
   * form). The upload flow never auto-imports against an unconfirmed
   * config.
   */
  @Prop({ default: true })
  confirmed: boolean;
}

export const TenantSourceConfigSchema = SchemaFactory.createForClass(TenantSourceConfig);
// Enforce one sourceId per tenant.
TenantSourceConfigSchema.index({ tenantId: 1, sourceId: 1 }, { unique: true });
// Fast lookup: "have we already confirmed a mapping for this file shape?"
TenantSourceConfigSchema.index({ tenantId: 1, columnSignature: 1 });
