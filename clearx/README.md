# ClearX

Multi-tenant reconciliation and settlement platform for electronic payment
transactions. Ingests raw transaction files (CSV, Excel, JSON) from banks,
PSPs, and switches, normalizes them into a unified schema, runs a matching
engine to reconcile transactions, and generates net settlement instructions.

## Stack

- NestJS (TypeScript)
- MySQL/PostgreSQL via TypeORM — transactional data
- MongoDB via Mongoose — tenant source configuration, field mappings, audit logs
- csvtojson / xlsx — file parsing
- class-validator — request validation
- Passport + JWT — authentication
- Swagger — API docs, served at `/docs`

## Getting started

```bash
npm install
cp .env.example .env   # then edit values for your environment
npm run start:dev
```

You'll need a running MySQL (or PostgreSQL) instance and a MongoDB instance
reachable at the URIs configured in `.env`. Run your own migrations before
enabling `DB_SYNCHRONIZE=true` only in local development — never in
production.

## Project layout

```
src/
  entities/          TypeORM entities: Tenant, UnifiedTransaction,
                      ReconciliationResult, SettlementInstruction
  auth/               JWT auth (login/register), Passport strategy, guard
  tenants/            Admin CRUD for Tenant
  config/             MongoDB-backed TenantSourceConfig + AuditLog
  normalization/       File parsing, field mapping, match-key resolution,
                      normalization orchestration, upload endpoint
  reconciliation/      Matching strategies, discrepancy classification,
                      result persistence, reconciliation orchestration
  settlement/          Netting stub -> SettlementInstruction generation
  transactions/        Filtered transaction listing endpoint
  dashboard/           Summary counts endpoint
  app.module.ts
  main.ts
```

## API surface

- `POST /auth/register`, `POST /auth/login`
- `GET/PATCH/DELETE /tenants`, `/tenants/:id` (admin)
- `GET/POST /config/sources`, `GET /config/sources/:sourceId`
- `POST /normalization/upload?sourceId=...` (multipart file upload)
- `POST /reconciliation/run` `{ sourceA, sourceB }`
- `GET /transactions?status=&source=&dateFrom=&dateTo=`
- `GET /reconciliation-results?status=`
- `GET /dashboard/summary`

All endpoints require a `Bearer` JWT except `/auth/login` and
`/auth/register`. The JWT payload carries `tenantId`, which every service
uses to scope queries and enforce multi-tenant isolation.

## Known gaps / next steps

This is a scaffold intended as a solid starting point, not a
production-hardened system. Before shipping, address at minimum:

- **Settlement/netting**: `NettingService` is a stub. It doesn't yet
  resolve debtor/creditor parties per transaction or build a real
  multi-party netting graph — this needs real business rules for how
  parties and accounts map from `UnifiedTransaction` data.
- **Role-based access**: Tenant CRUD endpoints currently rely only on
  `JwtAuthGuard`; add a proper admin/roles guard before exposing them.
- **Matching strategies**: `aggregateMatch` and `fuzzyMatch` are
  unimplemented stubs, as specified.
- **Migrations**: no TypeORM migrations are included; add them rather
  than relying on `synchronize`.
- **Rate limiting, request logging, and structured error responses**
  are not yet wired in.
- **BullMQ** is listed as a dependency for future background processing
  (e.g. async file ingestion) but no queues/processors are implemented yet.
- **Tests**: no unit or e2e tests are included yet.
