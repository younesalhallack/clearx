import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';

import { Tenant } from './entities/tenant.entity';
import { UnifiedTransaction } from './entities/unified-transaction.entity';
import { ReconciliationResult } from './entities/reconciliation-result.entity';
import { SettlementInstruction } from './entities/settlement-instruction.entity';

import { AuthModule } from './auth/auth.module';
import { TenantModule } from './tenants/tenant.module';
import { TenantConfigModule } from './config/config.module';
import { NormalizationModule } from './normalization/normalization.module';
import { ReconciliationModule } from './reconciliation/reconciliation.module';
import { SettlementModule } from './settlement/settlement.module';
import { TransactionsModule } from './transactions/transactions.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // MySQL/PostgreSQL connection for transactional data via TypeORM.
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: configService.get<string>('DB_TYPE', 'mysql') as any,
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get<string>('DB_USERNAME', 'clearx'),
        password: configService.get<string>('DB_PASSWORD', 'clearx'),
        database: configService.get<string>('DB_DATABASE', 'clearx'),
        entities: [Tenant, UnifiedTransaction, ReconciliationResult, SettlementInstruction],
        synchronize: configService.get<string>('DB_SYNCHRONIZE', 'false') === 'true',
        logging: configService.get<string>('DB_LOGGING', 'false') === 'true',
      }),
    }),

    // MongoDB connection for tenant configuration and audit logs.
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI', 'mongodb://localhost:27017/clearx_config'),
      }),
    }),

    AuthModule,
    TenantModule,
    TenantConfigModule,
    NormalizationModule,
    ReconciliationModule,
    SettlementModule,
    TransactionsModule,
    DashboardModule,
  ],
})
export class AppModule {}
