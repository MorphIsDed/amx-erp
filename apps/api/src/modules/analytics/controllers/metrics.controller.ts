import { Controller, Get, Header } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('System Metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  @ApiOperation({ summary: 'Prometheus metrics scrapable endpoint (Public)' })
  async getMetrics(): Promise<string> {
    const uptime = process.uptime();
    const memory = process.memoryUsage();

    // Measure PostgreSQL query latency
    const dbStart = Date.now();
    let dbStatus = 1;
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 0;
    }
    const dbLatency = Date.now() - dbStart;

    // Get CPU usage
    const cpuUsage = process.cpuUsage();
    const cpuTotal = (cpuUsage.user + cpuUsage.system) / 1000000; // in seconds

    // Compile into standard Prometheus exposition format
    const lines = [
      '# HELP amx_uptime_seconds The uptime of the NestJS process in seconds.',
      '# TYPE amx_uptime_seconds gauge',
      `amx_uptime_seconds ${uptime.toFixed(2)}`,
      '',
      '# HELP amx_process_cpu_seconds_total Total user and system CPU time spent in seconds.',
      '# TYPE amx_process_cpu_seconds_total counter',
      `amx_process_cpu_seconds_total ${cpuTotal.toFixed(6)}`,
      '',
      '# HELP amx_process_memory_rss_bytes Resident set size in bytes.',
      '# TYPE amx_process_memory_rss_bytes gauge',
      `amx_process_memory_rss_bytes ${memory.rss}`,
      '',
      '# HELP amx_process_memory_heap_used_bytes Heap memory used in bytes.',
      '# TYPE amx_process_memory_heap_used_bytes gauge',
      `amx_process_memory_heap_used_bytes ${memory.heapUsed}`,
      '',
      '# HELP amx_database_status Database connection status (1 = healthy, 0 = unhealthy).',
      '# TYPE amx_database_status gauge',
      `amx_database_status ${dbStatus}`,
      '',
      '# HELP amx_database_latency_ms Database response latency in milliseconds.',
      '# TYPE amx_database_latency_ms gauge',
      `amx_database_latency_ms ${dbLatency}`,
    ];

    return lines.join('\n');
  }
}
