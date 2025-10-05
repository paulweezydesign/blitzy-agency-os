### WHY – VISION & PURPOSE

- **What problem are you solving and for whom?**\
  Fragmented tools, slow approvals, scope creep, asset sprawl, and opaque budgets for digital design/dev agencies and their clients.

- **What does your application do?**\
  AgencyOS: a unified, client‑facing and internal platform for lead→proposal→SOW→delivery→approval→invoice→support.

- **Who will use it?**

  - Agency: Owners, PMs, Designers, Engineers, QA, Finance, Contractors.

  - Client: Client Admin, Stakeholder/Reviewer, Billing Only, Viewer.

- **Why will they use it instead of alternatives?**\
  One system of record, design‑native reviews, Git‑aware delivery, budget guardrails, integrated billing, two‑way sync with Figma/Jira/GitHub/Slack, white‑label client portal, full audit trail, AI assist for briefs, summaries, and risk alerts.

---

### WHAT – CORE REQUIREMENTS

- **What must your application do?**

  - System must support multi‑tenant workspaces with project‑level RBAC.

  - System must provide CRM, proposal/SOW builder, e‑signature, and deposit collection.

  - System must track budgets, time, utilization, and margin per project.

  - System must manage tasks/sprints with two‑way sync to Jira/Linear.

  - System must enable design reviews with annotated versions (Figma, PDFs, images, video).

  - System must integrate CI/CD previews for web apps and capture UAT feedback to issues.

  - System must handle change requests with scope, impact, and approval workflow.

  - System must invoice via Stripe and sync with QuickBooks/Xero.

  - System must offer a client portal for approvals, files, timelines, invoices, and status.

  - System must maintain an asset library with versioning and rights/usage.

  - System must provide knowledge base, intake forms, and reusable briefs.

  - System must deliver notifications (email, Slack, in‑app) and reminders.

  - System must expose APIs and webhooks; all actions auditable.

  - System must support localization, timezones, and accessibility (WCAG 2.2 AA).

- **What actions need to happen?**\
  Lead intake → proposal quote → SOW e‑sign → deposit → kickoff → sprint plan → design delivery → annotated review → dev tasking → QA → UAT → change requests if needed → release → client sign‑off → invoice → support/warranty.

- **What should the outcomes be?**

  - Reduce approval time, rework, and scope creep.

  - Improve on‑time delivery, utilization, and cash flow.

  - Increase forecast accuracy and client satisfaction.

  - KPIs: p50 approval cycle &lt;3 days, &lt;5% unbilled scope, on‑time milestones &gt;90%, DSO &lt;25 days.

---

### HOW – PLANNING & IMPLEMENTATION

- **What are the required stack components?**

  - Frontend: React 18+ with Next.js (App Router), TypeScript, TanStack Query, Zod, React Hook Form, Radix UI, Tailwind.

  - Backend: Node.js 20+ (NestJS or Fastify), TypeScript, REST + GraphQL, tRPC optional, BullMQ for jobs, WebSockets/SSE for realtime.

  - Data: PostgreSQL 15+ (row‑level security), Redis, S3‑compatible object storage, Meilisearch/OpenSearch for search, OpenAPI schema.

  - Integrations: Figma, Adobe CC, GitHub/GitLab, Jira/Linear, Slack/Teams, Notion/Confluence, Google Drive/Dropbox, DocuSign/Adobe Sign, Stripe, QuickBooks/Xero, Zoom/Calendly.

  - Infra: Docker, Kubernetes, IaC with Terraform, CDN + WAF, OTel + Prometheus + Grafana, Sentry, feature flags (Unleash/LaunchDarkly), secrets manager.

  - AI: Embeddings + vector store for project knowledge, brief drafting, meeting and review summaries, risk detection, RAG over past SOWs.

- **What are the system requirements?**

  - Performance: p95 API &lt;300 ms; p95 page load TTI &lt;2.5 s; search &lt;500 ms p95; uploads stream‑based.

  - Security: OIDC/SAML SSO, MFA, SCIM, RBAC + ABAC, least privilege, AES‑256 at rest, TLS 1.2+, key rotation, CIS hardening, audit logs, DLP on exports.

  - Scalability: Horizontal scale, tenant isolation, rate limiting, idempotent jobs, partitioned queues, backpressure.

  - Reliability: SLO 99.9% uptime; RTO 60 min; RPO 15 min; blue/green + canary; daily backups with quarterly restores tested.

  - Compliance: GDPR/CCPA, SOC 2 Type II controls mapped, data residency option, accessibility WCAG 2.2 AA.

  - Integration constraints: OAuth where possible, event‑driven sync, resilient retries, per‑tenant credentials.

- **What are the key user flows?**

  - New client onboarding: invite → domain/branding → roles → kickoff form → deposit paid → project starts; success = deposit confirmed, SOW signed, roles assigned.

  - Design review: upload/link Figma → create review → threaded comments → version compare → client approve/reject; alt = request changes triggers task creation.

  - Dev delivery: PR opened → preview URL captured → UAT session → defects auto‑logged to Jira/Linear → release gate passes on approvals.

  - Change request: request logged → impact calc (budget/timeline) → client approval → scope updates and invoice.

  - Billing: milestone reached → invoice auto‑draft → send → pay via Stripe → ledger sync; dunning after N days.

  - Support: ticket intake → SLA timers → escalation → CSAT capture → knowledge article suggested.

- **What are the core interfaces?**

  - Client Portal: project status, approvals, invoices, files, timelines.

  - Project Workspace: roadmap, sprints, tasks, risks, budgets, burndown.

  - Design Review: viewport, version diff, annotations, approvals.

  - UAT & QA: test runs, checklists, environment links, defect capture.

  - Proposal/SOW Builder: pricing, scope blocks, terms, e‑sign.

  - Resource & Time: scheduling, timesheets, utilization, capacity.

  - Billing & Finance: invoices, deposits, WIP, margins, DSO.

  - Asset Library: versions, rights, search, share links.

  - Admin Console: tenants, roles, integrations, audit, policies.

  - Reports: profitability, velocity, forecast, SLA, client health.

---

### BUSINESS REQUIREMENTS

- **What are your access and authentication needs?**

  - Roles: Super Admin, Admin, PM, Designer, Engineer, QA, Finance, Contractor, Client Admin, Client Reviewer, Client Billing, Viewer.

  - SSO: OIDC/SAML, MFA, SCIM provisioning, per‑project access grants, shareable review links with expiry and watermarking.

- **What business rules must be followed?**

  - No project work without signed SOW and deposit.

  - Approvals are binding and versioned; only Client Admin can re‑open.

  - Changes require approved CR with budget/time impact logged.

  - Invoices auto‑generated on milestone; net‑terms enforced; dunning at 3/7/14 days.

  - Time entries must map to scope items; overages trigger alerts at 80/100/120%.

  - Data retention: 24 months after project close unless contracted; right to erasure honored within 30 days.

  - SLAs: first response 1 business day standard, 4 hours premium; uptime SLO 99.9%.

  - Exports must be encrypted; PII access logged; least‑privilege enforced.

- **What are your implementation priorities?**

  - High: Multi‑tenant core, RBAC, proposal/SOW + e‑sign + payments, project workspace, design review, UAT with PR previews, Jira/Linear + GitHub + Figma + Slack integrations, client portal, invoicing, audit logs, basic reporting.

  - Medium: Resource planning, utilization and margin dashboards, change request engine, knowledge base, advanced search, feature flags, white‑labeling, SCIM.

  - Lower: Public case‑study generator from project artifacts, AI risk forecasts, cost anomaly detection, multi‑region, on‑prem option, data residency controls.