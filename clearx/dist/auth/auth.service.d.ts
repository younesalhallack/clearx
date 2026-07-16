import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Tenant } from '../entities/tenant.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private readonly tenantRepository;
    private readonly jwtService;
    constructor(tenantRepository: Repository<Tenant>, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        tenant: Partial<Tenant>;
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        tenant: Partial<Tenant>;
    }>;
    private signToken;
    private sanitize;
}
