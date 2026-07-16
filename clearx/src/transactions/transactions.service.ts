import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { UnifiedTransaction } from '../entities/unified-transaction.entity';

export interface TransactionQueryFilters {
  status?: string;
  source?: string;
  dateFrom?: string;
  dateTo?: string;
}

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(UnifiedTransaction)
    private readonly transactionRepository: Repository<UnifiedTransaction>,
  ) {}

  async findAll(
    tenantId: string,
    filters: TransactionQueryFilters,
  ): Promise<UnifiedTransaction[]> {
    const where: Record<string, any> = { tenantId };

    if (filters.status) where.status = filters.status;
    if (filters.source) where.source = filters.source;
    if (filters.dateFrom && filters.dateTo) {
      where.transactionDate = Between(new Date(filters.dateFrom), new Date(filters.dateTo));
    }

    return this.transactionRepository.find({
      where,
      order: { transactionDate: 'DESC' },
      take: 500,
    });
  }
}
