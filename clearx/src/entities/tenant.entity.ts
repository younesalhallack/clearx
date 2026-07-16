import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum TenantStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  TRIAL = 'trial',
}

/**
 * Tenant represents a financial institution / client organization using the
 * ClearX platform. Every other entity in the system carries a `tenantId`
 * foreign key back to this table to enforce strict data isolation between
 * tenants (multi-tenancy).
 */
@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  // Password hash for tenant admin login. Never expose via API responses.
  @Column({ type: 'varchar', length: 255, select: false })
  passwordHash: string;

  @Column({ type: 'varchar', length: 3, default: 'SAR' })
  defaultCurrency: string;

  @Column({ type: 'varchar', length: 64, default: 'UTC' })
  timezone: string;

  @Column({ type: 'enum', enum: TenantStatus, default: TenantStatus.TRIAL })
  status: TenantStatus;

  /**
   * Self-referencing identifier used across all other tables for row-level
   * multi-tenant isolation. Mirrors `id` but kept as an explicit column so
   * every query/repository can filter uniformly on `tenantId` without having
   * to special-case the Tenant table itself.
   */
  @Index()
  @Column({ type: 'uuid' })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
