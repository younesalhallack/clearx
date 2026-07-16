import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { UnifiedTransaction } from '../entities/unified-transaction.entity';
import { TenantConfigModule } from '../config/config.module';
import { FileParserService } from './services/file-parser.service';
import { FieldTransformerService } from './services/field-transformer.service';
import { MatchKeyResolverService } from './services/match-key-resolver.service';
import { NormalizationService } from './services/normalization.service';
import { NormalizationController } from './normalization.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([UnifiedTransaction]),
    TenantConfigModule,
    MulterModule.register({ dest: '/tmp/clearx-uploads' }),
  ],
  controllers: [NormalizationController],
  providers: [
    FileParserService,
    FieldTransformerService,
    MatchKeyResolverService,
    NormalizationService,
  ],
  exports: [NormalizationService],
})
export class NormalizationModule {}
