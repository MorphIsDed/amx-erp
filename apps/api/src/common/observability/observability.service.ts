import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { Redis } from 'ioredis';
import * as register from 'prom-client';
import * as fs from 'fs';
import * as os from 'os';

@Injectable()
export class ObservabilityService implements OnModuleInit {
  private redisClient: Redis;
  private mlServiceUrl: string;

  // Prometheus Metrics Registrations
  public apiRequestCount: register.Counter;
  public apiRequestDuration: register.Histogram;
  public apiActiveRequests: register.Gauge;

  public dbQueryCount: register.Counter;
  public dbQueryDuration: register.Histogram;
  public dbSlowQueries: register.Counter;

  public queueActiveJobs: register.Gauge;
  public queueFailedJobs: register.Gauge;
  public queueLatency: register.Gauge;

  public forecastCount: register.Counter;
  public forecastAccuracy: register.Gauge;
  public forecastRetrainDuration: register.Gauge;
  public forecastFailures: register.Counter;

  public webhookDeliveries: register.Counter;
  public webhookSuccessRate: register.Gauge;
  public webhookFailureRate: register.Gauge;
  public webhookRetries: register.Counter;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.redisClient = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
    });
    this.mlServiceUrl = this.configService.get<string>(
      'ML_SERVICE_URL',
      'http://localhost:8000',
    );

    // Enable prom-client collection of default process metrics (CPU, Memory, etc.)
    register.collectDefaultMetrics({ prefix: 'amx_process_' });

    // Initialize custom Prometheus metrics
    this.apiRequestCount = new register.Counter({
      name: 'amx_api_requests_total',
      help: 'Total number of API requests received',
      labelNames: ['method', 'path', 'status'],
    });

    this.apiRequestDuration = new register.Histogram({
      name: 'amx_api_request_duration_seconds',
      help: 'API request execution duration in seconds',
      labelNames: ['method', 'path'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
    });

    this.apiActiveRequests = new register.Gauge({
      name: 'amx_api_active_requests',
      help: 'Number of active/in-flight requests',
    });

    this.dbQueryCount = new register.Counter({
      name: 'amx_db_queries_total',
      help: 'Total database queries executed',
      labelNames: ['operation', 'model'],
    });

    this.dbQueryDuration = new register.Histogram({
      name: 'amx_db_query_duration_seconds',
      help: 'Database query execution time in seconds',
      labelNames: ['operation', 'model'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
    });

    this.dbSlowQueries = new register.Counter({
      name: 'amx_db_slow_queries_total',
      help: 'Total queries exceeding 100ms response time',
      labelNames: ['operation', 'model'],
    });

    this.queueActiveJobs = new register.Gauge({
      name: 'amx_queue_active_jobs',
      help: 'Current active BullMQ jobs',
      labelNames: ['queue'],
    });

    this.queueFailedJobs = new register.Gauge({
      name: 'amx_queue_failed_jobs',
      help: 'Current failed BullMQ jobs',
      labelNames: ['queue'],
    });

    this.queueLatency = new register.Gauge({
      name: 'amx_queue_latency_seconds',
      help: 'Job execution processing lag time',
      labelNames: ['queue'],
    });

    this.forecastCount = new register.Counter({
      name: 'amx_forecast_predictions_total',
      help: 'Total AI forecast requests dispatched',
      labelNames: ['sku', 'status'],
    });

    this.forecastAccuracy = new register.Gauge({
      name: 'amx_forecast_accuracy_mape',
      help: 'Forecast model mean absolute percentage error (MAPE)',
      labelNames: ['sku'],
    });

    this.forecastRetrainDuration = new register.Gauge({
      name: 'amx_forecast_retrain_duration_seconds',
      help: 'Duration of AI model retraining jobs',
    });

    this.forecastFailures = new register.Counter({
      name: 'amx_forecast_failures_total',
      help: 'Total forecast request errors/outages',
    });

    this.webhookDeliveries = new register.Counter({
      name: 'amx_webhook_deliveries_total',
      help: 'Total webhooks dispatched',
      labelNames: ['event', 'status'],
    });

    this.webhookSuccessRate = new register.Gauge({
      name: 'amx_webhook_success_rate',
      help: 'Success rate ratio for outgoing webhooks',
    });

    this.webhookFailureRate = new register.Gauge({
      name: 'amx_webhook_failure_rate',
      help: 'Failure rate ratio for outgoing webhooks',
    });

    this.webhookRetries = new register.Counter({
      name: 'amx_webhook_retries_total',
      help: 'Total number of webhook dispatch retry attempts',
    });
  }

  onModuleInit() {
    // Bootstrap integrations if needed
  }

  /**
   * Get raw Prometheus scrapable metrics exposition data
   */
  async getPrometheusMetrics(): Promise<string> {
    // Dynamic queue updates on scrape
    await this.updateQueueMetrics();
    return register.register.metrics();
  }

  /**
   * Internal helper to retrieve BullMQ stats from Redis
   */
  private async updateQueueMetrics() {
    const queues = ['notifications', 'webhooks', 'payroll'];
    for (const q of queues) {
      try {
        const active = await this.redisClient.llen(`bull:${q}:active`);
        const failed = await this.redisClient.scard(`bull:${q}:failed`);
        this.queueActiveJobs.set({ queue: q }, active);
        this.queueFailedJobs.set({ queue: q }, failed);
      } catch {
        // Fallback if redis query fails
      }
    }
  }

  /**
   * SRE System Health, Readiness, and Liveness Diagnostics
   */
  async getHealthReport(): Promise<any> {
    const report: any = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {},
    };

    // 1. Database connection check
    try {
      const start = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      report.checks.database = {
        status: 'UP',
        latencyMs: Date.now() - start,
      };
    } catch (e: any) {
      report.status = 'unhealthy';
      report.checks.database = { status: 'DOWN', error: e.message };
    }

    // 2. Redis connection check
    try {
      const start = Date.now();
      const pingResult = await this.redisClient.ping();
      report.checks.redis = {
        status: pingResult === 'PONG' ? 'UP' : 'DOWN',
        latencyMs: Date.now() - start,
      };
      if (pingResult !== 'PONG') report.status = 'unhealthy';
    } catch (e: any) {
      report.status = 'unhealthy';
      report.checks.redis = { status: 'DOWN', error: e.message };
    }

    // 3. FastAPI ML service check
    try {
      const start = Date.now();
      const res = await fetch(`${this.mlServiceUrl}/health`, {
        signal: AbortSignal.timeout(2000),
      });
      report.checks.forecasting = {
        status: res.ok ? 'UP' : 'DOWN',
        latencyMs: Date.now() - start,
      };
      if (!res.ok) report.status = 'unhealthy';
    } catch (e: any) {
      report.checks.forecasting = { status: 'DOWN', error: e.message };
      // Do not make entire ERP unhealthy if forecasting down, but label appropriately
    }

    // 4. BullMQ Queue Health status check
    try {
      const queues = ['notifications', 'webhooks', 'payroll'];
      const queueStatus: any = {};
      const queueHealthy = true;

      for (const q of queues) {
        await this.redisClient.exists(`bull:${q}:meta`);
        queueStatus[q] = { active: true };
      }

      report.checks.queues = {
        status: queueHealthy ? 'UP' : 'DEGRADED',
        queues: queueStatus,
      };
    } catch (e: any) {
      report.checks.queues = { status: 'DOWN', error: e.message };
    }

    // 5. Local Storage (Disk usage checking via fs.statfsSync Node API)
    try {
      const stats = fs.statfsSync(process.cwd());
      const freeBytes = stats.bfree * stats.bsize;
      const totalBytes = stats.blocks * stats.bsize;
      const percentageUsed = ((totalBytes - freeBytes) / totalBytes) * 100;

      report.checks.storage = {
        status: percentageUsed > 90 ? 'WARNING' : 'UP',
        freeGb: Math.round((freeBytes / (1024 * 1024 * 1024)) * 100) / 100,
        totalGb: Math.round((totalBytes / (1024 * 1024 * 1024)) * 100) / 100,
        percentageUsed: Math.round(percentageUsed * 100) / 100,
      };
      if (percentageUsed > 95) report.status = 'unhealthy';
    } catch (e: any) {
      report.checks.storage = { status: 'DOWN', error: e.message };
    }

    return report;
  }

  /**
   * SRE Capacity Projections
   */
  async getCapacityPlanning(): Promise<any> {
    // 1. Gather current memory/CPU
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const processMemory = process.memoryUsage().rss;

    // 2. Fetch Database stats (Approx count of invoice items, activity logs)
    const logsCount = await this.prisma.activityLog.count();
    const transactionsCount = await this.prisma.transaction.count();
    const productsCount = await this.prisma.product.count();

    // 3. Projections based on linear expansion (assumed daily growth from logs)
    const dailyLogGrowth = 15; // Average expected logs daily
    const dailyTxGrowth = 5;

    const projectDbGrowth = (days: number) => {
      const projectedLogs = logsCount + dailyLogGrowth * days;
      const projectedTx = transactionsCount + dailyTxGrowth * days;
      // Estimate bytes (approx 500 bytes per DB record)
      const projectedBytes = (projectedLogs + projectedTx) * 500;

      return {
        estimatedDbSizeMb:
          Math.round((projectedBytes / (1024 * 1024)) * 100) / 100,
        activityLogsCount: projectedLogs,
        transactionCount: projectedTx,
      };
    };

    // Calculate free disk metrics
    let diskFreeGb: number;
    try {
      const stats = fs.statfsSync(process.cwd());
      diskFreeGb = (stats.bfree * stats.bsize) / (1024 * 1024 * 1024);
    } catch {
      diskFreeGb = 100;
    }

    return {
      system: {
        cpuCores: os.cpus().length,
        freeMemoryGb:
          Math.round((freeMemory / (1024 * 1024 * 1024)) * 100) / 100,
        totalMemoryGb:
          Math.round((totalMemory / (1024 * 1024 * 1024)) * 100) / 100,
        processMemoryMb:
          Math.round((processMemory / (1024 * 1024)) * 100) / 100,
      },
      currentStorage: {
        databaseRecords: logsCount + transactionsCount + productsCount,
        diskFreeGb: Math.round(diskFreeGb * 100) / 100,
      },
      projections: {
        30: projectDbGrowth(30),
        60: projectDbGrowth(60),
        90: projectDbGrowth(90),
      },
    };
  }
}
