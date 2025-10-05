# ADR 0003: Use Event-Driven Integration Backbone with BullMQ & Webhooks

- Status: Proposed
- Date: 2025-02-14
- Decision Makers: Platform Integration WG
- Related Specs: target_tech_spec.pdf §2.3, §4.1, §5.1.3, §6.3, §6.5

## Context

AgencyOS orchestrates design reviews, development sync, billing, and client comms across external platforms (Figma, GitHub/GitLab, Stripe, Slack/Teams, Jira/Linear). These systems emit asynchronous events and have rate/availability constraints. The spec calls for webhook receivers, retry/circuit breaker patterns, and internal event routing to prevent third-party instability from impacting user experience.

## Decision

- **Inbound integrations**: Capture webhooks via dedicated Fastify controllers in the API gateway; normalize payloads into canonical domain events.
- **Event transport**: Use Redis-backed BullMQ queues for guaranteed delivery, retry with exponential backoff, and dead-letter queues for inspection (§6.5.3).
- **Internal event bus**: Publish normalized events (e.g., `DesignAssetUpdated`, `InvoicePaid`) to a lightweight in-memory/Redis pub-sub layer consumed by domain modules.
- **Outbound actions**: Workers perform API calls to external services; circuit breaker component monitors failure rates and trips when thresholds hit.
- **Observability**: Every integration event logs trace/span IDs, retry counts, and tenant context; events exceeding SLA push alerts via PagerDuty/SNS (§5.4.1–5.4.3).
- **Schema governance**: Event payloads versioned with TypeScript types + JSON Schema, checked in `packages/contracts`.

## Consequences

- **Pros**
  - Decouples UX from third-party latency, enabling optimistic UI patterns.
  - Provides consistent retry/backoff behavior and centralized failure visibility.
  - Supports future scaling by moving hot integrations into separate workers without contract changes.

- **Cons**
  - Introduces operational overhead for queue monitoring and DLQ draining.
  - Requires disciplined schema evolution to avoid consumer breakage.
  - Adds latency for workflows that remain asynchronous even when partners are highly available.

## Follow-Up Actions

1. Stand up integration module skeleton with webhook receivers, queue publishers, and DLQ dashboards.
2. Define event naming conventions and JSON Schema registry.
3. Document SLOs per integration (latency, success rate) and wire alerts in observability stack.
