# Deployment & Topology Overview

_Aligned with target_tech_spec.pdf §5.1, §5.2, §8.1–8.7_

## 1. Logical Architecture

```
[Browser / Client Apps]
        |
        v
[CloudFront CDN] -- static assets, edge caching
        |
        v
[ALB (HTTPS/TLS 1.3)] -- WAF, rate limiting, geo rules
        |
        v
+-------------------------------+
|      EKS Cluster (multi-AZ)   |
|  +-------------------------+  |
|  |  Next.js Frontend Pods  |  | <-- autoscaled, read-only config
|  +-------------------------+  |
|  |  NestJS API Pods        |  | <-- API gateway + domain modules
|  +-------------------------+  |
|  |  Worker Pods (BullMQ)   |  | <-- webhook processors, automations
|  +-------------------------+  |
|  |  Cron / Scheduler Pods  |  |
|  +-------------------------+  |
+-------------------------------+
        |
        +--> [Redis Cluster (ElastiCache)] -- sessions, queues, pub/sub
        |
        +--> [RDS PostgreSQL 15] -- primary + read replicas
        |
        +--> [S3 Buckets] -- assets, backups, logs
        |
        +--> [Meilisearch 1.5] -- search/indexes per tenant
        |
        +--> [InfluxDB / Analytics] -- performance + usage metrics
        |
        +--> [External Services] -- Figma, GitHub, Stripe, Slack, etc.
```

## 2. AWS Physical Topology

| Layer                | Service / Resource                                       | Notes |
|----------------------|-----------------------------------------------------------|-------|
| Edge & DNS           | Route53, CloudFront, AWS WAF, AWS Shield                 | Geo-routing for us-east-1 primary, health checks for failover |
| Ingress              | Application Load Balancer (public subnets)               | Terminates TLS; forwards to EKS Ingress controllers |
| Compute              | Amazon EKS (managed node groups, Bottlerocket/AL2)       | Separate node pools for web, API, workers |
| Service Mesh (opt.)  | AWS App Mesh or Linkerd (future)                         | Not MVP-critical but reserved for traffic shaping |
| Data                 | Amazon RDS for PostgreSQL (multi-AZ), ElastiCache Redis  | PgBouncer sidecars; Redis cluster mode enabled |
| Storage              | S3 (assets, backups), S3 Glacier (archival)              | Lifecycle policies per tenant data class |
| Search               | Self-managed Meilisearch on EKS or EC2 (tbc)             | Requires EBS gp3 volumes + backup strategy |
| Observability        | CloudWatch, Datadog agents, OpenTelemetry Collector pods | Metrics/logs/traces aggregated to Datadog/New Relic |
| Secrets & Config     | AWS Secrets Manager, SSM Parameter Store                 | Tenanted credentials, rotation policies |
| Networking           | VPC with 3 AZs, public/private subnets, NAT gateways     | Private subnets for data stores; SG least privilege |

## 3. Environment Strategy

- **Regions**: Primary `us-east-1`; active secondary regions `eu-west-1`, `ap-southeast-2`, DR `us-west-2` (§8.1.1).
- **Promotion flow**: sandbox → dev → staging → production; each environment has isolated VPC + RDS clusters; lower envs can share reduced node pools.
- **Multi-tenancy**: Single shared infrastructure with logical isolation; per-tenant throttles enforced at API gateway and queue consumers.
- **Failover**: Cross-region read replicas for Postgres; CloudFront + Route53 failover policies; automated EKS cluster backups via Velero.

## 4. Security & Compliance Controls

- TLS 1.3 end-to-end, HSTS enforced; ACM cert rotation automated.
- AWS WAF rules for OWASP Top 10, rate-based policies, country blocks (customizable per tenant requirement).
- IAM roles per service account (IRSA) segregating access to S3, Secrets Manager, and third-party creds.
- VPC endpoints for S3, Secrets Manager, KMS; outbound access restricted through NAT + egress security groups.
- Audit logging pipeline: ALB access logs → S3 → Athena; application structured logs → CloudWatch → Datadog; immutable audit events persisted in Postgres partitioned tables (§6.4.2).

## 5. Operational Hooks

- **CI/CD**: GitHub Actions builds container images, pushes to ECR, triggers CodeDeploy blue/green to EKS.
- **Autoscaling**: 
  - HPA on CPU/memory and queue depth for API + worker pods.
  - Karpenter/Cluster Autoscaler to scale node groups.
- **Backups**:
  - PostgreSQL automated snapshots + PITR; logical backups to S3.
  - Redis RDB/AOF; snapshot cadence aligned with RPO 15 min.
  - Meilisearch index snapshots nightly.
- **Monitoring**: SLO dashboards for p95 latency (<300 ms), availability (99.9%), queue depth, integration success rates.

## 6. Future Considerations

- Evaluate App Mesh / service mesh once cross-cutting tracing and traffic policies require richer controls.
- Consider managed OpenSearch with vector support if Meilisearch scaling becomes burdensome.
- Prepare runbooks for cross-region failover drills (quarterly) to satisfy SOC 2 Type II evidence.
