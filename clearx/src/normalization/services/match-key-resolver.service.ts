import { Injectable, Logger } from '@nestjs/common';
import { FieldMappingRule } from './field-transformer.service';

/**
 * Resolves the `primaryMatchKey` for a raw record based on the tenant's
 * configured matching strategy:
 *  - single_field: copy one source field verbatim.
 *  - composite: concatenate multiple fields into a single key.
 *  - hierarchical: use the first non-empty field from a priority list.
 */
@Injectable()
export class MatchKeyResolverService {
  private readonly logger = new Logger(MatchKeyResolverService.name);

  resolve(rawRecord: Record<string, any>, rule?: FieldMappingRule): string {
    if (!rule) {
      this.logger.warn('No primaryMatchKey rule configured; falling back to empty key');
      return '';
    }

    switch (rule.strategy) {
      case 'composite':
        return (rule.fields ?? [])
          .map((f) => (rawRecord[f] ?? '').toString().trim())
          .join('|');

      case 'hierarchical':
        for (const f of rule.fields ?? []) {
          const value = rawRecord[f];
          if (value !== undefined && value !== null && value !== '') {
            return value.toString().trim();
          }
        }
        return '';

      case 'single_field':
      default:
        const value = rule.fieldName ? rawRecord[rule.fieldName] : undefined;
        return value !== undefined && value !== null ? value.toString().trim() : '';
    }
  }
}
