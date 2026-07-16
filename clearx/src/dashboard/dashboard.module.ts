import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnifiedTransaction } from '../entities/unified-transaction.entity';
import { SettlementInstruction } from '../entities/settlement-instruction.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UnifiedTransaction, SettlementInstruction])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
