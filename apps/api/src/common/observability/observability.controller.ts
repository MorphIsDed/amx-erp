import { Controller, Get, Header, UseGuards } from '@nestjs/common';
import { ObservabilityService } from './observability.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '@repo/db';

@ApiTags('Observability & SRE Operations')
@Controller()
export class ObservabilityController {
  constructor(private readonly obsService: ObservabilityService) {}

  @Get('metrics')
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  @ApiOperation({ summary: 'Exposes scrapable Prometheus metrics' })
  async getMetrics(): Promise<string> {
    return this.obsService.getPrometheusMetrics();
  }

  @Get('health')
  @ApiOperation({ summary: 'Detailed system health diagnostics report' })
  async getHealth() {
    return this.obsService.getHealthReport();
  }

  @Get('readiness')
  @ApiOperation({ summary: 'Readiness check for load balancer status' })
  async getReadiness() {
    const report = await this.obsService.getHealthReport();
    // In readiness, if database or redis is down, return unhealthy (503)
    if (report.status === 'unhealthy') {
      return { status: 'unhealthy', error: 'Dependencies down' };
    }
    return { status: 'ready' };
  }

  @Get('liveness')
  @ApiOperation({ summary: 'Simple liveness check for container health' })
  getLiveness() {
    // If the process is running, we are alive
    return { status: 'alive' };
  }

  @Get('observability/capacity')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'SRE capacity forecasting report (Admin only)' })
  async getCapacity() {
    return this.obsService.getCapacityPlanning();
  }
}
