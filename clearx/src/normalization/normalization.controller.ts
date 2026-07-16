import {
  BadRequestException,
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
import { TenantConfigService } from '../config/config.service';

@ApiTags('normalization')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('normalization')
export class NormalizationController {
  constructor(
    private readonly normalizationService: NormalizationService,
    private readonly tenantConfigService: TenantConfigService,
  ) {}

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
}
