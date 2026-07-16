import { Repository } from 'typeorm';
import { Tenant } from '../entities/tenant.entity';
export declare class TenantService {
    private readonly tenantRepository;
    constructor(tenantRepository: Repository<Tenant>);
    findAll(): Promise<Tenant[]>;
    findOne(id: string): Promise<Tenant>;
    update(id: string, partial: Partial<Tenant>): Promise<Tenant>;
    remove(id: string): Promise<void>;
}
