import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Tenant, TenantStatus } from '../entities/tenant.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{ accessToken: string; tenant: Partial<Tenant> }> {
    const existing = await this.tenantRepository.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('A tenant with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const tenantId = uuidv4();

    const tenant = this.tenantRepository.create({
      id: tenantId,
      tenantId,
      name: dto.name,
      email: dto.email,
      passwordHash,
      defaultCurrency: dto.defaultCurrency ?? 'SAR',
      timezone: dto.timezone ?? 'UTC',
      status: TenantStatus.TRIAL,
    });

    const saved = await this.tenantRepository.save(tenant);
    const accessToken = this.signToken(saved);

    return { accessToken, tenant: this.sanitize(saved) };
  }

  async login(dto: LoginDto): Promise<{ accessToken: string; tenant: Partial<Tenant> }> {
    const tenant = await this.tenantRepository
      .createQueryBuilder('tenant')
      .addSelect('tenant.passwordHash')
      .where('tenant.email = :email', { email: dto.email })
      .getOne();

    if (!tenant) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(dto.password, tenant.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (tenant.status === TenantStatus.SUSPENDED) {
      throw new UnauthorizedException('Tenant account is suspended');
    }

    const accessToken = this.signToken(tenant);
    return { accessToken, tenant: this.sanitize(tenant) };
  }

  private signToken(tenant: Tenant): string {
    const payload = {
      sub: tenant.id,
      tenantId: tenant.tenantId,
      email: tenant.email,
    };
    return this.jwtService.sign(payload);
  }

  private sanitize(tenant: Tenant): Partial<Tenant> {
    const { passwordHash, ...rest } = tenant;
    return rest;
  }
}
