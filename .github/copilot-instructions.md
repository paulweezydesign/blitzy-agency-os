# Copilot Instructions

## Quick start
- This is a pnpm workspace pinned to `pnpm@10.13.1`; install once with `pnpm install` at the repo root.
- Run the NestJS API locally with `pnpm dev:api` (Fastify server bound to the port from `app.config`).
- Validate changes before committing with `pnpm lint` and targeted runs such as `pnpm --filter api test` or `test:watch`.

## Architecture snapshot
- `apps/api` hosts a NestJS 11 + Fastify gateway forming the first slice of the modular monolith defined in `docs/adr/0001-hybrid-platform-architecture.md`.
- Tenant awareness is centralized in `TenantModule` (`tenant-context.interceptor.ts` + `tenant-context.service.ts`) which wraps each request in AsyncLocalStorage seeded from the `x-tenant-id` header.
- `JwtAuthGuard` (and `AuthService`) decorates Fastify requests with the JWT payload; populate `tenant_id` and `permissions` claims so downstream providers can call `TenantContextService.get()`.

## Patterns & conventions
- Configuration lives in `apps/api/src/config` and is registered with `ConfigModule.forFeature`; define schemas with Zod and return typed objects via `registerAs`.
- Controllers and guards should use Fastify request/response types; Express helpers are not available.
- Read tenant/user context only through `TenantContextService` instead of passing headers around or instantiating new ALS stores.
- Shared business logic should graduate into `packages/*` modules as they are created; avoid deep relative imports that cross planned module seams.
- Integrations and async workflows should publish internal events and enqueue BullMQ jobs per `docs/adr/0003-event-driven-integration.md` (workers live under `apps/workers` once scaffolded).

## Testing & validation
- Follow the lightweight unit test style in `apps/api/src/health/health.controller.spec.ts` using Nest TestingModule and direct method assertions.
- Extend `apps/api/test/app.e2e-spec.ts` for end-to-end coverage with the Fastify adapter initialized (call `app.getHttpAdapter().getInstance().ready()` before requests).
- Keep tests deterministic; mock external providers until dedicated integration test suites exist.

## Environment & secrets
- `app.config.ts` coerces `NODE_ENV` and `PORT` (default 3000); prefer adding new env parsing here rather than inline `process.env` accesses.
- Auth defaults to disabled unless `AUTH_ENABLED=true` or `AUTH_SECRET` is supplied; local smoke tests can omit secrets to bypass auth.
- When emitting background jobs or events, include tenant + request metadata so downstream consumers can rehydrate context (requirement of ADR-0002).

## Key references
- Product and domain background: `target_tech_spec.md` and `build_prompt.md`.
- Architectural guardrails: `docs/adr/*.md` and deployment details in `docs/architecture/`.
- Planned workspace layout: `pnpm-workspace.yaml` lists `apps/*` and `packages/*`; scaffold new modules within this structure and document any deviation.
