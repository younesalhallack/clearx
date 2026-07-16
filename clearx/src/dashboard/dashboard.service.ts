import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnifiedTransaction, TransactionStatus } from '../entities/unified-transaction.entity';
import { SettlementInstruction } from '../entities/settlement-instruction.entity';

export interface DashboardSummary {
  totalTransactions: number;
  matchedCount: number;
  matchedPercentage: number;
  unmatchedCount: number;
  discrepancyCount: number;
  netSettlementAmount: string;
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(UnifiedTransaction)
    private readonly transactionRepository: Repository<UnifiedTransaction>,
    @InjectRepository(SettlementInstruction)
    private readonly instructionRepository: Repository<SettlementInstruction>,
  ) {}

  async getSummary(tenantId: string): Promise<DashboardSummary> {
    const [total, matched, unmatched, discrepancy] = await Promise.all([
      this.transactionRepository.count({ where: { tenantId } }),
      this.transactionRepository.count({ where: { tenantId, status: TransactionStatus.MATCHED } }),
      this.transactionRepository.count({ where: { tenantId, status: TransactionStatus.UNMATCHED } }),
      this.transactionRepository.count({ where: { tenantId, status: TransactionStatus.DISCREPANCY } }),
    ]);

    const instructions = await this.instructionRepository.find({ where: { tenantId } });
    const netSettlementAmount = instructions
      .reduce((sum, i) => sum + parseFloat(i.netAmount), 0)
      .toFixed(3);

    return {
      totalTransactions: total,
      matchedCount: matched,
      matchedPercentage: total > 0 ? Math.round((matched / total) * 10000) / 100 : 0,
      unmatchedCount: unmatched,
      discrepancyCount: discrepancy,
      netSettlementAmount,
    };
  }
}
