import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NormalizationService } from './services/normalization.service';
import { FileParserService, FileFormatOptions, FileFormatType } from './services/file-parser.service';
import { SchemaDetectionService } from './services/schema-detection.service';
import { TenantConfigService } from '../config/config.service';
import { ConfirmAndImportFormDto } from './dto/confirm-and-import-form.dto';

@ApiTags('normalization')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('normalization')
export class NormalizationController {
  constructor(
    private readonly normalizationService: NormalizationService,
    private readonly fileParserService: FileParserService,
    private readonly schemaDetectionService: SchemaDetectionService,
    private readonly tenantConfigService: TenantConfigService,
  ) {}

  /**
   * Existing "known source" import path: the tenant already has a
   * confirmed TenantSourceConfig (created manually, or previously
   * confirmed via the detect/confirm-and-import flow below) and just
   * wants to import another file against it.
   */
  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Query('sourceId') sourceId: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    if (!sourceId) {
      throw new BadRequestException('sourceId query parameter is required');
    }

    const tenantId = req.user.tenantId;
    const sourceConfig = await this.tenantConfigService.findSourceConfig(tenantId, sourceId);

    const summary = await this.normalizationService.normalizeAndSave(
      tenantId,
      sourceConfig,
      file.path,
      file.originalname,
    );

    await this.tenantConfigService.recordAudit(tenantId, 'NORMALIZATION_RUN', 'UnifiedTransaction', undefined, {
      sourceId,
      fileName: file.originalname,
      ...summary,
    });

    return summary;
  }

  /**
   * Analyzes an uploaded file without importing anything: parses it,
   * computes a signature for its column shape, and either (a) reports a
   * previously-confirmed config that already matches this exact shape —
   * in which case the client should just call POST /normalization/upload
   * directly — or (b) returns a suggested field mapping with per-field
   * confidence scores for the tenant to review before anything is saved.
   *
   * Nothing is persisted by this endpoint. It never imports data.
   */
  @Post('detect')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async detect(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const tenantId = req.user.tenantId;
    const format = this.guessFileFormat(file.originalname);
    const rawRecords = await this.fileParserService.parseFile(file.path, format);

    if (rawRecords.length === 0) {
      throw new BadRequestException('File appears to have no data rows to analyze');
    }

    const detection = this.schemaDetectionService.detect(rawRecords);

    const matchedConfig = await this.tenantConfigService.findByColumnSignature(
      tenantId,
      detection.signature,
    );

    return {
      signature: detection.signature,
      headers: detection.headers,
      sampleRows: detection.sampleRows,
      guessedFileFormat: format,
      // If set, this file shape was already confirmed before — the
      // client can skip straight to POST /normalization/upload using
      // this sourceId and never needs to show a confirmation screen.
      matchedConfig: matchedConfig
        ? { sourceId: matchedConfig.sourceId, sourceName: matchedConfig.sourceName }
        : null,
      // Only meaningful when matchedConfig is null — the tenant reviews
      // (and can override) these before confirming.
      suggestions: matchedConfig ? null : detection.suggestions,
      allEssentialFieldsCovered: detection.allEssentialFieldsCovered,
    };
  }

  /**
   * Saves a tenant-approved field mapping for a newly-seen file shape,
   * then immediately imports the same file against it. This is always a
   * human-confirmed action — there is no code path that reaches this
   * without an explicit request carrying the tenant's approved mapping,
   * regardless of how confident /detect's suggestions were.
   */
  @Post('confirm-and-import')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async confirmAndImport(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: ConfirmAndImportFormDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const tenantId = req.user.tenantId;

    let fileFormat: Record<string, any>;
    let fieldMapping: Record<string, any>;
    let validationRules: Record<string, any> | undefined;
    try {
      fileFormat = JSON.parse(body.fileFormat);
      fieldMapping = JSON.parse(body.fieldMapping);
      validationRules = body.validationRules ? JSON.parse(body.validationRules) : undefined;
    } catch {
      throw new BadRequestException('fileFormat, fieldMapping, and validationRules must be valid JSON');
    }

    const savedConfig = await this.tenantConfigService.saveConfirmedSourceConfig(tenantId, {
      columnSignature: body.columnSignature,
      sourceId: body.sourceId,
      sourceName: body.sourceName,
      paymentMethod: body.paymentMethod,
      fileFormat,
      fieldMapping,
      validationRules,
    });

    const summary = await this.normalizationService.normalizeAndSave(
      tenantId,
      savedConfig,
      file.path,
      file.originalname,
    );

    await this.tenantConfigService.recordAudit(
      tenantId,
      'NORMALIZATION_RUN_AFTER_CONFIRMATION',
      'UnifiedTransaction',
      undefined,
      { sourceId: body.sourceId, fileName: file.originalname, ...summary },
    );

    return { sourceConfig: savedConfig, summary };
  }

  /**
   * Best-effort file-format guess from the extension alone, used only at
   * /detect time when no source config exists yet to describe how the
   * file should be parsed. The tenant can override delimiter/encoding/etc
   * before confirming if this guess is wrong.
   */
  private guessFileFormat(filename: string): FileFormatOptions {
    const extension = filename.split('.').pop()?.toLowerCase();
    let type: FileFormatType = 'csv';
    if (extension === 'xlsx' || extension === 'xls') type = extension;
    else if (extension === 'json') type = 'json';

    return {
      type,
      delimiter: ',',
      encoding: 'utf-8',
      hasHeader: true,
      skipRows: 0,
    };
  }
}
