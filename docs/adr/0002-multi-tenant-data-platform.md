# ADR 0002: Centralize Multi-Tenant Data on PostgreSQL with RLS

- Status: Proposed
- Date: 2025-02-14
- Decision Makers: Data Architecture WG
- Related Specs: target_tech_spec.pdf §2.2.1, §3.5, §5.2.3, §6.4.1

## Context

AgencyOS must isolate data across agency workspaces while enabling shared services (search, analytics, billing) to reason about cross-tenant activity. The spec prescribes PostgreSQL 15 with Row-Level Security (RLS), PgBouncer, Redis 7.2, S3/CloudFront, and Meilisearch. Alternatives (schema-per-tenant, database-per-tenant) introduce operational overhead and deployment complexity that conflict with MVP timelines and auto-scaling requirements.

## Decision

- **Primary datastore**: PostgreSQL 15.x with:
  - Tenant isolation enforced via RLS policies on every table, leveraging `security_invoker` views (§5.2.3).
  - Time-based partitioning for audit/event tables (§3.5.1).
  - JSONB columns for dynamic project metadata (§3.5.1).
- **Connection management**: PgBouncer 1.21+ in transaction pooling mode; tenant context established per request using `SET LOCAL` statements.
- **Caching & realtime**: Redis 7.2 cluster for sessions, job queues (BullMQ), pub/sub state fan-out (§3.5.2).
- **Object storage**: AWS S3 with tenant-prefixed buckets, CloudFront CDN, Glacier archival policies (§3.5.3).
- **Search & analytics**:
  - Meilisearch 1.5+ for per-tenant full-text + vector search (#6.4.3).
  - InfluxDB + PostgreSQL warehouse for analytics (§3.5.5).
- **ORM Layer**: Prisma 5.x with strict typing and migration governance; migrations must define RLS policies and seed tenant bootstrap data alongside schema changes.

## Consequences

- **Pros**
  - Uniform isolation model reduces application-code conditional logic, mitigating accidental data leaks.
  - Shared cluster keeps costs predictable while supporting horizontal scaling through read replicas and partitioning.
  - Integration with Prisma simplifies type-safe access and aligns with unified TypeScript stack.
  - Redis + Meilisearch provide clear patterns for high-throughput reads without sacrificing isolation.

- **Cons**
  - RLS misconfiguration risks blocking legitimate access; migration review checklist required.
  - Hot tenants can create “noisy neighbor” scenarios—requires connection quotas and monitoring.
  - Multi-service access (workers, API, scripts) must consistently set tenant context; tooling must enforce this.

## Follow-Up Actions

1. Build tenant context middleware for API gateway and background workers.
2. Author migration template including RLS policy scaffolding and regression checks.
3. Define operational runbooks for Postgres failover, read replicas, and tenant hot-spot mitigation.
