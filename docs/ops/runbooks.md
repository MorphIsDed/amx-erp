# AMX-ERP Incident Response & Operational Runbooks

This document details recovery procedures, diagnostics, and operational rollback steps for SREs managing AMX-ERP.

---

## 🗄️ RUNBOOK 01 — Database Failure & Latency
**Alert Trigger:** `DatabaseDown` or `SlowQueries`
**Symptom:** API logs display database timeout errors, `/health` endpoint reports `database: DOWN`.

### Diagnostic Steps
1. Verify PostgreSQL container health:
   ```bash
   docker ps -f name=postgres
   ```
2. Check PostgreSQL log tail for active lock waits or out-of-memory errors:
   ```bash
   docker logs --tail 100 postgres
   ```
3. Audit long-running locked queries:
   ```sql
   SELECT pid, age(clock_timestamp(), query_start), usename, query 
   FROM pg_stat_activity 
   WHERE state != 'idle' AND age(clock_timestamp(), query_start) > interval '5 seconds';
   ```

### Recovery Procedures
1. **Restart Database Container:**
   ```bash
   docker-compose restart postgres
   ```
2. **Force-terminate long query blocking lock queues:**
   ```sql
   SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE pid = <BLOCKED_PID>;
   ```
3. **Database Migration Rollback:**
   To roll back a faulty Prisma migration, run:
   ```bash
   npx prisma migrate resolve --rolled-back "<FAULTY_MIGRATION_NAME>"
   ```

---

## 🛑 RUNBOOK 02 — Redis & Queue Failures
**Alert Trigger:** `RedisDown` or `QueueBacklog`
**Symptom:** Webhooks not firing, payroll runs stuck in `PROCESSING` status, background queue sizes spiking.

### Diagnostic Steps
1. Check Redis container health status:
   ```bash
   docker ps -f name=redis
   ```
2. Tail Redis log outputs:
   ```bash
   docker logs --tail 100 redis
   ```
3. List active queues and count queued items:
   ```bash
   redis-cli -h localhost -p 6379 keys "bull:*"
   ```

### Recovery Procedures
1. **Restart Redis container:**
   ```bash
   docker-compose restart redis
   ```
2. **Flush corrupt job descriptors:**
   In case a corrupt payroll job blocks the BullMQ queue, log in to `redis-cli` and run:
   ```bash
   redis-cli del "bull:payroll:waiting" "bull:payroll:active"
   ```
3. **Scale worker capacity:**
   Increase NestJS background worker pool threads in `.env` (`BULL_WORKERS=5`).

---

## 🌐 RUNBOOK 03 — Webhook Failures & Backlog
**Alert Trigger:** `InvoiceProcessingFailure`
**Symptom:** Outbound webhooks consistently reporting `FAILED` status, webhook queue backlog rising.

### Diagnostic Steps
1. Check webhook processing job details in Redis:
   ```bash
   redis-cli lrange "bull:webhooks:failed" 0 10
   ```
2. Test network egress routes from the API container to the remote webhook target:
   ```bash
   docker exec -it api curl -I <TARGET_WEBHOOK_URL>
   ```

### Recovery Procedures
1. **Retry Webhook Deliveries:**
   Trigger the webhook retry script to re-dispatch failed payloads from database audit tables:
   ```bash
   pnpm run webhooks:retry-failed
   ```
2. **Disable Non-Responsive Subscriptions:**
   Temporarily disable a broken subscription causing extreme backlogs:
   ```sql
   UPDATE "WebhookSubscription" SET "isActive" = false WHERE id = '<SUSPICIOUS_ID>';
   ```

---

## 🤖 RUNBOOK 04 — AI Forecasting Service Outages
**Alert Trigger:** `ForecastingServiceDown` or `ForecastRetrainingFailure`
**Symptom:** `/analytics` charts show static data lines, ML logs display HTTP 500 errors, `/health` reports `forecasting: DOWN`.

### Diagnostic Steps
1. Check FastAPI docker container logs:
   ```bash
   docker logs --tail 100 ml-service
   ```
2. Validate local registry json exists and is readable:
   ```bash
   ls -la apps/ml-service/registry.json
   ```

### Recovery Procedures
1. **Restart ML service container:**
   ```bash
   docker-compose restart ml-service
   ```
2. **Re-initialize Model Registry:**
   If `registry.json` is corrupted, delete it and trigger a model rebuild:
   ```bash
   rm apps/ml-service/registry.json
   docker exec -it api pnpm --filter api run retrain-models
   ```

---

## 🔑 RUNBOOK 05 — Authentication Failures & Suspicious Activity
**Alert Trigger:** `ExcessiveLoginFailures` or `RbacViolations`
**Symptom:** User logs report a high volume of `401` or `403` HTTP responses.

### Diagnostic Steps
1. Filter authentication log audit lines in the API log files:
   ```bash
   grep -i "auth" /var/log/amx-api.json
   ```

### Recovery Procedures
1. **Revoke User Token:**
   If a user token is compromised, change the user's password in the database, which invalidates active JWTs (due to database validation checks).
2. **Temporarily Disable Compromised Tenant Account:**
   ```sql
   UPDATE "Tenant" SET "domain" = NULL WHERE id = '<COMPROMISED_TENANT_ID>';
   ```
