# API Gateway, Tenant Context, and RBAC Implementation Plan

_Reference: target_tech_spec.pdf §2.2.1–§2.2.2, §5.2.2, §5.4.4, §6.2.1–§6.2.2_

## 1. Repository & Package Layout (proposed)

```
/apps
  /web              -> Next.js 15 frontend
  /api              -> NestJS 11 application (gateway + domain modules)
  /workers          -> BullMQ processors (shares domain packages)
/packages
  /config           -> shared configuration (env validation, secrets)
  /domain           -> business entities, DTOs, events
  /infra            -> database/redis clients, instrumentation
  /rbac             -> role definitions, policy engine, guards
  /tenant           -> tenant context middleware, bootstrap utilities
  /contracts        -> OpenAPI schemas, event JSON schemas
```

## 2. API Gateway Bootstrap Tasks

1. **NestJS project skeleton**
   - Init with `nest new api` using TypeScript strict mode.
   - Configure Fastify adapter, global validation pipe (class-validator + Zod optional), and exception filters.
2. **Configuration module**
   - Centralize env parsing (dotenv-flow) with schemas; expose strongly typed config service.
3. **Auth module**
   - Implement JWT verification (Auth0/OIDC per spec §3.3.2).
   - Provide guard to attach `request.authContext` with user, tenant, roles.
4. **Tenant module**
   - Interceptor sets Prisma/DB context via AsyncLocalStorage.
   - Ensure outbound BullMQ jobs include tenant metadata.
5. **RBAC module**
   - Encode role hierarchy (SuperAdmin, Admin, PM, Designer, Client roles) and project-level overrides.
   - Expose decorators (`@RequirePermission`) and guard to evaluate against context.
6. **Audit middleware**
   - Log request metadata (tenant, user, action) for ingestion by audit trail service (§6.4.2).
7. **OpenAPI generator**
   - Use `nestjs-swagger` or `tsoa` equivalent; publish API docs per module.

## 3. Prisma & Database Layer

- Generate Prisma client with multi-tenant helper (context-aware `prisma.$extends`).
- Implement `tenant_context` table storing workspace config, slug, feature flags.
- Provide seeding script for initial roles/permissions and super-admin tenant.
- Add migration template to enforce RLS policies per table.

## 4. RBAC Policy Engine

- Define role constants and permission map in `/packages/rbac/src/permissions.ts`.
- Support attribute-based checks (project ownership, budget visibility) using predicates reading from context + DB.
- Deliver front-end consumable policy manifest via `/api/rbac/policies` endpoint for UI gating.

## 5. Integration with Frontend & Workers

- Frontend `apps/web` consumes session token, attaches `X-Tenant-ID` header.
- WebSocket handshake validates tenant and role before joining rooms.
- Worker processors load tenant context from job data, set `SET LOCAL` before DB access, and enforce RBAC for admin-triggered actions.

## 6. Observability & Guardrails

- Apply NestJS interceptors for tracing (OpenTelemetry) and metrics (Histogram for latency per route/tenant).
- Configure rate limiting per tenant (in-memory for dev, Redis sliding window for prod).
- Implement feature flags (LaunchDarkly or config-driven) but ensure RBAC decisions remain authoritative.

## 7. Incremental Delivery Milestones

1. **Milestone A**: Bootstrapped API app with health check, JWT validation, tenant context stub, and Prisma connection.
2. **Milestone B**: RBAC module delivering role enforcement on sample `/workspaces/:id` endpoints; includes migration with RLS on `workspaces` table.
3. **Milestone C**: Audit logging + OpenAPI docs; integration tests covering tenant isolation and permission rejections.
4. **Milestone D**: Background worker template demonstrating webhook ingestion with tenant propagation.

## 8. Open Questions / Risks

- Confirm identity provider (Auth0 vs alternative) to finalize JWT claim structure.
- Decide on caching layer for `role → permission` maps (Redis vs in-memory) to balance performance vs consistency.
- Determine strategy for cross-tenant contractors (shared user ID with multiple tenant memberships); requires composite keys and session multiplexing.
- Validate choice of AsyncLocalStorage vs request-scoped providers for tenant propagation under Fastify.


## 9. Milestone A Progress (2025-02-14)

- [x] pnpm workspace scaffolded with `apps/api` NestJS app using Fastify.
- [x] Global config + health module delivering `/health` endpoint and typed env parsing.
- [x] Tenant context service/interceptor using AsyncLocalStorage stub.
- [x] Placeholder JWT guard + auth service ready for real provider wiring.

### Local Development

1. `pnpm install`
2. `pnpm dev:api` (defaults to port 3000; override with `PORT`)
3. `curl http://localhost:3000/health` → `{ "status": "ok" }`

### Next Targets

- Persist audit trail events to PostgreSQL and expose query endpoints.
- Implement granular permission mapping (feature-specific policies) and decorator utilities.
- Wire Workspaces API into client portal flows and add e2e coverage.
- Extend worker runtime with named processors for integrations and error retry policies.


## 10. Milestone B Progress (2025-10-05)

- [x] Added Prisma ORM scaffolding with PostgreSQL schema for workspaces, users, memberships, and projects.
- [x] Registered global Prisma module with tenant-aware AsyncLocalStorage hook.
- [x] Introduced workspaces service to demonstrate repository usage and unit coverage.
- [x] Exposed `pnpm prisma:generate` workspace script and `.env.example` for local DB setup.


## 11. Milestone C Progress (2025-10-05)

- [x] Upgraded authentication to JWKS-backed verification with Auth0-compatible config.
- [x] Added structured logging via `nestjs-pino`, request/trace interceptors, and audit logging.
- [x] Introduced Prisma-backed RBAC service plus protected `/workspaces/:slug` controller.
- [x] Factored tenant context into shared package and bootstrapped BullMQ worker runtime.
