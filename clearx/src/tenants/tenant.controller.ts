import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantService } from './tenant.service';
import { Tenant } from '../entities/tenant.entity';

/**
 * Administrative CRUD for tenants. In production this should additionally
 * be restricted to a super-admin role via a dedicated RolesGuard; the JWT
 * guard alone is applied here per the base spec.
 */
@ApiTags('tenants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get()
  async findAll() {
    return this.tenantService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.tenantService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: Partial<Tenant>) {
    return this.tenantService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.tenantService.remove(id);
    return { success: true };
  }
}
