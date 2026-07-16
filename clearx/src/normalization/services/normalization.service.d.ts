import { Repository } from 'typeorm';
import { UnifiedTransaction } from '../../entities/unified-transaction.entity';
import { FileParserService } from './file-parser.service';
import { FieldTransformerService } from './field-transformer.service';
import { MatchKeyResolverService } from './match-key-resolver.service';
import { TenantSourceConfig } from '../../config/schemas/tenant-source-config.schema';
export interface NormalizationSummary {
    totalRecords: number;
    savedRecords: number;
    rejectedRecords: number;
    rejectionReasons: {
        index: number;
        reason: string;
    }[];
}
export declare class NormalizationService {
    private readonly transactionRepository;
    private readonly fileParserService;
    private readonly fieldTransformerService;
    private readonly matchKeyResolverService;
    private readonly logger;
    constructor(transactionRepository: Repository<UnifiedTransaction>, fileParserService: FileParserService, fieldTransformerService: FieldTransformerService, matchKeyResolverService: MatchKeyResolverService);
    normalizeAndSave(tenantId: string, sourceConfig: TenantSourceConfig, filePath: string, fileName: string): Promise<NormalizationSummary>;
    private validateRecord;
    private resolveSourceEnum;
}
