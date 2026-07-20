import { NormalizationService } from './services/normalization.service';
import { FileParserService, FileFormatOptions } from './services/file-parser.service';
import { SchemaDetectionService } from './services/schema-detection.service';
import { TenantConfigService } from '../config/config.service';
import { ConfirmAndImportFormDto } from './dto/confirm-and-import-form.dto';
export declare class NormalizationController {
    private readonly normalizationService;
    private readonly fileParserService;
    private readonly schemaDetectionService;
    private readonly tenantConfigService;
    constructor(normalizationService: NormalizationService, fileParserService: FileParserService, schemaDetectionService: SchemaDetectionService, tenantConfigService: TenantConfigService);
    upload(req: any, file: Express.Multer.File, sourceId: string): Promise<import("./services/normalization.service").NormalizationSummary>;
    detect(req: any, file: Express.Multer.File): Promise<{
        signature: string;
        headers: string[];
        sampleRows: Record<string, any>[];
        guessedFileFormat: FileFormatOptions;
        matchedConfig: {
            sourceId: string;
            sourceName: string;
        } | null;
        suggestions: import("./services/schema-detection.service").FieldSuggestion[] | null;
        allEssentialFieldsCovered: boolean;
    }>;
    confirmAndImport(req: any, file: Express.Multer.File, body: ConfirmAndImportFormDto): Promise<{
        sourceConfig: import("../config/schemas/tenant-source-config.schema").TenantSourceConfig;
        summary: import("./services/normalization.service").NormalizationSummary;
    }>;
    private guessFileFormat;
}
