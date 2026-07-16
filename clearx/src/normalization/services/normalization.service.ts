import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  UnifiedTransaction,
  TransactionStatus,
} from '../../entities/unified-transaction.entity';
import { 
  FieldMapping, 
  FieldMappingRule 
} from './field-transformer.service';
import { FileParserService, FileFormatOptions } from './file-parser.service';
import { FieldTransformerService } from './field-transformer.service';
import { MatchKeyResolverService } from './match-key-resolver.service';
import { TenantSourceConfig } from '../../config/schemas/tenant-source-config.schema';


export interface NormalizationSummary {
  totalRecords: number;
  savedRecords: number;
  rejectedRecords: number;
  rejectionReasons: { index: number; reason: string }[];
}

/**
 * Orchestrates the ingestion pipeline: parse a raw source file, apply the
 * tenant's field mapping to normalize each record, resolve the matching
 * key, validate against configured rules, and persist UnifiedTransaction
 * rows with status PENDING.
 */
@Injectable()
export class NormalizationService {
  private readonly logger = new Logger(NormalizationService.name);

  constructor(
    @InjectRepository(UnifiedTransaction)
    private readonly transactionRepository: Repository<UnifiedTransaction>,
    private readonly fileParserService: FileParserService,
    private readonly fieldTransformerService: FieldTransformerService,
    private readonly matchKeyResolverService: MatchKeyResolverService,
  ) {}

  async normalizeAndSave(
    tenantId: string,
    sourceConfig: TenantSourceConfig,
    filePath: string,
    fileName: string,
  ): Promise<NormalizationSummary> {
    const formatOptions: FileFormatOptions = {
      type: sourceConfig.fileFormat.type as any,
      delimiter: sourceConfig.fileFormat.delimiter,
      encoding: sourceConfig.fileFormat.encoding as BufferEncoding,
      hasHeader: sourceConfig.fileFormat.hasHeader,
      skipRows: sourceConfig.fileFormat.skipRows,
    };

    const rawRecords = await this.fileParserService.parseFile(filePath, formatOptions);

    const summary: NormalizationSummary = {
      totalRecords: rawRecords.length,
      savedRecords: 0,
      rejectedRecords: 0,
      rejectionReasons: [],
    };

    const entitiesToSave: Partial<UnifiedTransaction>[] = [];

    rawRecords.forEach((rawRecord, index) => {
      try {
        const validationError = this.validateRecord(rawRecord, sourceConfig);
        if (validationError) {
          summary.rejectedRecords += 1;
          summary.rejectionReasons.push({ index, reason: validationError });
          return;
        }

        const normalized = this.fieldTransformerService.transformRecord(
          rawRecord,
          sourceConfig.fieldMapping as FieldMapping,
        );

        const primaryMatchKey = this.matchKeyResolverService.resolve(
          rawRecord,
          sourceConfig.fieldMapping['primaryMatchKey'] as FieldMappingRule,
        );

        entitiesToSave.push({
          tenantId,
          paymentMethod: sourceConfig.paymentMethod as any,
          primaryMatchKey,
          ...normalized,
          status: TransactionStatus.PENDING,
          source: this.resolveSourceEnum(sourceConfig.paymentMethod),
          sourceFileName: fileName,
          ingestedAt: new Date(),
          rawPayload: rawRecord,
        });
      } catch (error: any) {
        summary.rejectedRecords += 1;
        summary.rejectionReasons.push({ index, reason: error.message ?? 'Unknown error' });
      }
    });

    if (entitiesToSave.length > 0) {
      const saved = await this.transactionRepository.save(entitiesToSave as UnifiedTransaction[]);
      summary.savedRecords = saved.length;
    }

    this.logger.log(
      `Normalization complete for tenant ${tenantId}: ${summary.savedRecords}/${summary.totalRecords} saved`,
    );

    return summary;
  }

  private validateRecord(
    rawRecord: Record<string, any>,
    sourceConfig: TenantSourceConfig,
  ): string | null {
    const rules = sourceConfig.validationRules;
    if (!rules) return null;

    if (rules.requiredFields?.length) {
      for (const field of rules.requiredFields) {
        if (
          rawRecord[field] === undefined ||
          rawRecord[field] === null ||
          rawRecord[field] === ''
        ) {
          return `Missing required field: ${field}`;
        }
      }
    }

    const amountFieldRule = sourceConfig.fieldMapping['amount'];
    if (amountFieldRule?.fieldName) {
      const amount = parseFloat(rawRecord[amountFieldRule.fieldName]);
      if (!Number.isNaN(amount)) {
        if (rules.minAmount !== undefined && amount < rules.minAmount) {
          return `Amount ${amount} below configured minimum ${rules.minAmount}`;
        }
        if (rules.maxAmount !== undefined && amount > rules.maxAmount) {
          return `Amount ${amount} above configured maximum ${rules.maxAmount}`;
        }
      }
    }

    return null;
  }

  private resolveSourceEnum(paymentMethod: string): any {
    // Best-effort default mapping; tenants can override via richer config
    // in a future iteration (e.g. an explicit `source` field on the config).
    switch (paymentMethod) {
      case 'BANK_TRANSFER':
        return 'BANK_FILE';
      case 'CARD':
        return 'SWITCH';
      case 'EBPP':
        return 'BILLING_SYSTEM';
      default:
        return 'PSP';
    }
  }
}
