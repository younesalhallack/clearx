import { NormalizationService } from './services/normalization.service';
import { TenantConfigService } from '../config/config.service';
export declare class NormalizationController {
    private readonly normalizationService;
    private readonly tenantConfigService;
    constructor(normalizationService: NormalizationService, tenantConfigService: TenantConfigService);
    upload(req: any, file: Express.Multer.File, sourceId: string): Promise<import("./services/normalization.service").NormalizationSummary>;
}
