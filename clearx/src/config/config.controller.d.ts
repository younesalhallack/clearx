import { TenantConfigService } from './config.service';
import { CreateSourceConfigDto } from './dto/create-source-config.dto';
export declare class ConfigController {
    private readonly tenantConfigService;
    constructor(tenantConfigService: TenantConfigService);
    create(req: any, dto: CreateSourceConfigDto): Promise<import("./schemas/tenant-source-config.schema").TenantSourceConfig>;
    findAll(req: any): Promise<import("./schemas/tenant-source-config.schema").TenantSourceConfig[]>;
    findOne(req: any, sourceId: string): Promise<import("./schemas/tenant-source-config.schema").TenantSourceConfig>;
}
