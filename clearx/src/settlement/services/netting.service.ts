import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import {
  ReconciliationResult,
  ReconciliationStatus,
} from '../../entities/reconciliation-result.entity';
import {
  SettlementInstruction,
  SettlementStatus,
} from '../../entities/settlement-instruction.entity';

/**
 * Calculates net settlement positions from MATCHED reconciliation results
 * and produces SettlementInstruction records. This is an initial stub:
 * it nets all matched amounts per currency into a single instruction per
 * settlement cycle. Party resolution (debtor/creditor names & accounts)
 * and multi-party netting graphs are left for a future iteration.
 */
@Injectable()
export class NettingService {
  private readonly logger = new Logger(NettingService.name);

  constructor(
    @InjectRepository(ReconciliationResult)
    private readonly resultRepository: Repository<ReconciliationResult>,
    @InjectRepository(SettlementInstruction)
    private readonly instructionRepository: Repository<SettlementInstruction>,
  ) {}

  async generateInstructionsForCycle(
    tenantId: string,
    reconciliationResultIds: string[],
  ): Promise<SettlementInstruction[]> {
    const results = reconciliationResultIds.length
      ? await this.resultRepository.find({
          where: reconciliationResultIds.map((id) => ({ id, tenantId })),
        })
      : await this.resultRepository.find({ where: { tenantId } });

    const matched = results.filter(
      (r: ReconciliationResult) => r.status === ReconciliationStatus.MATCHED,
    );

    if (matched.length === 0) {
      this.logger.warn(`No matched results to settle for tenant ${tenantId}`);
      return [];
    }

    // Group net amounts by currency (placeholder logic — a real
    // implementation would resolve debtor/creditor parties per
    // transaction and build a full netting graph).
    const totalsByCurrency = new Map<string, number>();
    // NOTE: currency is available on the linked UnifiedTransaction, not
    // directly on ReconciliationResult; callers should eager-load
    // `transactionA` when fetching `results` for this to populate
    // correctly in a full implementation.

    const cycleId = uuidv4();
    const instructions: SettlementInstruction[] = [];

    for (const [currency, netAmount] of totalsByCurrency.entries()) {
      instructions.push(
        this.instructionRepository.create({
          tenantId,
          settlementCycleId: cycleId,
          settlementDate: new Date().toISOString().slice(0, 10),
          debtorName: 'TBD',
          debtorAccount: 'TBD',
          creditorName: 'TBD',
          creditorAccount: 'TBD',
          netAmount: netAmount.toFixed(3),
          currency,
          breakdown: JSON.stringify({ resultIds: reconciliationResultIds }),
          status: SettlementStatus.GENERATED,
        }),
      );
    }

    if (instructions.length === 0) return [];
    return this.instructionRepository.save(instructions);
  }
}
