import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantConfigService } from './config.service';
import { CreateSourceConfigDto } from './dto/create-source-config.dto';

@ApiTags('config')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('config/sources')
export class ConfigController {
  constructor(private readonly tenantConfigService: TenantConfigService) {}

  @Post()
  async create(@Req() req: any, @Body() dto: CreateSourceConfigDto) {
    const tenantId = req.user.tenantId;
    return this.tenantConfigService.createSourceConfig(tenantId, dto);
  }

  @Get()
  async findAll(@Req() req: any) {
    const tenantId = req.user.tenantId;
    return this.tenantConfigService.findAllSourceConfigs(tenantId);
  }

  @Get(':sourceId')
  async findOne(@Req() req: any, @Param('sourceId') sourceId: string) {
    const tenantId = req.user.tenantId;
    return this.tenantConfigService.findSourceConfig(tenantId, sourceId);
  }
}
