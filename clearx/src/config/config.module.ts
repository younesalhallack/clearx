import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TenantSourceConfig, TenantSourceConfigSchema } from './schemas/tenant-source-config.schema';
import { AuditLog, AuditLogSchema } from './schemas/audit-log.schema';
import { TenantConfigService } from './config.service';
import { ConfigController } from './config.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TenantSourceConfig.name, schema: TenantSourceConfigSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  controllers: [ConfigController],
  providers: [TenantConfigService],
  exports: [TenantConfigService],
})
export class TenantConfigModule {}
