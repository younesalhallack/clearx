import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        tenant: Partial<import("../entities/tenant.entity").Tenant>;
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        tenant: Partial<import("../entities/tenant.entity").Tenant>;
    }>;
}
