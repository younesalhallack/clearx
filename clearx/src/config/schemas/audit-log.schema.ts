import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ collection: 'audit_logs', timestamps: false })
export class AuditLog {
  @Prop({ required: true, index: true })
  tenantId: string;

  @Prop({ required: true })
  action: string; // e.g. 'NORMALIZATION_RUN', 'RECONCILIATION_RUN', 'MANUAL_MATCH'

  @Prop({ required: true })
  entity: string; // e.g. 'UnifiedTransaction', 'ReconciliationResult'

  @Prop()
  entityId?: string;

  @Prop({ required: true, default: () => new Date() })
  timestamp: Date;

  @Prop({ type: Object, default: {} })
  details: Record<string, any>;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
