"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const uuid_1 = require("uuid");
const tenant_entity_1 = require("../entities/tenant.entity");
const SALT_ROUNDS = 12;
let AuthService = class AuthService {
    constructor(tenantRepository, jwtService) {
        this.tenantRepository = tenantRepository;
        this.jwtService = jwtService;
    }
    async register(dto) {
        const existing = await this.tenantRepository.findOne({ where: { email: dto.email } });
        if (existing) {
            throw new common_1.ConflictException('A tenant with this email already exists');
        }
        const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
        const tenantId = (0, uuid_1.v4)();
        const tenant = this.tenantRepository.create({
            id: tenantId,
            tenantId,
            name: dto.name,
            email: dto.email,
            passwordHash,
            defaultCurrency: dto.defaultCurrency ?? 'SAR',
            timezone: dto.timezone ?? 'UTC',
            status: tenant_entity_1.TenantStatus.TRIAL,
        });
        const saved = await this.tenantRepository.save(tenant);
        const accessToken = this.signToken(saved);
        return { accessToken, tenant: this.sanitize(saved) };
    }
    async login(dto) {
        const tenant = await this.tenantRepository
            .createQueryBuilder('tenant')
            .addSelect('tenant.passwordHash')
            .where('tenant.email = :email', { email: dto.email })
            .getOne();
        if (!tenant) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const passwordMatches = await bcrypt.compare(dto.password, tenant.passwordHash);
        if (!passwordMatches) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (tenant.status === tenant_entity_1.TenantStatus.SUSPENDED) {
            throw new common_1.UnauthorizedException('Tenant account is suspended');
        }
        const accessToken = this.signToken(tenant);
        return { accessToken, tenant: this.sanitize(tenant) };
    }
    signToken(tenant) {
        const payload = {
            sub: tenant.id,
            tenantId: tenant.tenantId,
            email: tenant.email,
        };
        return this.jwtService.sign(payload);
    }
    sanitize(tenant) {
        const { passwordHash, ...rest } = tenant;
        return rest;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map