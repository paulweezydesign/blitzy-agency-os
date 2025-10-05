# ADR 0001: Adopt Hybrid Modular Monolith Architecture

- Status: Proposed
- Date: 2025-02-14
- Decision Makers: Architecture Guild
- Related Specs: target_tech_spec.pdf §5.1.1, §5.3.1

## Context

AgencyOS must deliver a unified experience across CRM, project delivery, design review, billing, and client collaboration while supporting rapid iteration and tight multi-tenant data controls. The spec (p.66, p.73) recommends a "hybrid monolithic-microservices" approach that keeps core business domains cohesive but preserves seams for future decomposition. Early roadmap features (F-001 through F-021) share overlapping data and workflows—splitting into microservices prematurely would duplicate domain logic, complicate RLS enforcement, and slow down the MVP timeline.

## Decision

We will implement AgencyOS as a modular monolith composed of:

- **Frontend application**: Next.js 15 App Router (React 18/19 ready) for SSR/CSR, asset optimization, and real-time UX integration (§5.1.2).
- **API gateway + domain modules**: A NestJS 11 application with clearly defined modules (workspace, RBAC, project, design review, billing, integrations) sharing a single deployable artifact but communicating through dependency-injected boundaries.
- **Background workers**: BullMQ-based processors that live in the same codebase but run as dedicated processes for webhooks, automation, and event fan-out.
- **Shared service layer**: Cross-cutting services (auth, audit, observability, search, event bus) exposed as injectable providers.

Modules will publish and consume domain events over an internal event bus, enabling asynchronous workflows without breaking monolith cohesion. Service contracts (DTOs, OpenAPI schemas) must treat module boundaries as if they were external to avoid tight coupling.

## Consequences

- **Pros**
  - Accelerates MVP delivery by avoiding premature service decomposition.
  - Simplifies tenant isolation by centralizing PostgreSQL RLS enforcement in one codebase.
  - Reduces integration overhead—single CI/CD pipeline, unified deployment, shared observability wiring.
  - Facilitates future extraction: module seams, event contracts, and repository structure prepare for microservice spin-out when scale demands it.

- **Cons**
  - Requires disciplined boundaries to avoid "big ball of mud"; code reviews must enforce module contracts.
  - Horizontal scaling limited to process-level replication; extreme traffic may necessitate later decomposition.
  - Mixed concerns in a single repo can increase cognitive load without strong documentation and tooling.

## Follow-Up Actions

1. Publish module ownership map and folder layout in `docs/architecture/structure.md`.
2. Define ADRs for data layer (ADR-0002) and integration/event strategy (ADR-0003).
3. Configure lint / build tooling to enforce module import boundaries (eslint import/no-restricted-paths).
