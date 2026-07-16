import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReconciliationService } from './services/reconciliation.service';
import { RunReconciliationDto } from './dto/run-reconciliation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReconciliationResult } from '../entities/reconciliation-result.entity';

@ApiTags('reconciliation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class ReconciliationController {
  constructor(
    private readonly reconciliationService: ReconciliationService,
    @InjectRepository(ReconciliationResult)
    private readonly resultRepository: Repository<ReconciliationResult>,
  ) {}

  @Post('reconciliation/run')
  async run(@Req() req: any, @Body() dto: RunReconciliationDto) {
    const tenantId = req.user.tenantId;
    return this.reconciliationService.runCycle({
      tenantId,
      sourceA: dto.sourceA,
      sourceB: dto.sourceB,
    });
  }

  @Get('reconciliation-results')
  async findResults(
    @Req() req: any,
    @Query('status') status?: string,
  ) {
    const tenantId = req.user.tenantId;
    const where: Record<string, any> = { tenantId };
    if (status) where.status = status;
    return this.resultRepository.find({ where, order: { createdAt: 'DESC' } });
  }
}
