import { TenantService } from './tenant.service';
import { Tenant } from '../entities/tenant.entity';
export declare class TenantController {
    private readonly tenantService;
    constructor(tenantService: TenantService);
    findAll(): Promise<Tenant[]>;
    findOne(id: string): Promise<Tenant>;
    update(id: string, body: Partial<Tenant>): Promise<Tenant>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
