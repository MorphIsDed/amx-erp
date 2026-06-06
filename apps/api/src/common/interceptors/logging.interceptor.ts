import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { trace } from '@opentelemetry/api';
import { ObservabilityService } from '../observability/observability.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly obsService: ObservabilityService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const req = httpContext.getRequest();
    const res = httpContext.getResponse();

    // Increment active request gauge
    this.obsService.apiActiveRequests.inc();

    const start = Date.now();
    const method = req.method;
    const path = req.route ? req.route.path : req.url;

    // Generate/get Request ID
    const requestId =
      req.headers['x-request-id'] ||
      `req_${Math.random().toString(36).substr(2, 9)}`;
    req.id = requestId;

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = (Date.now() - start) / 1000; // in seconds
          const statusCode = res.statusCode;

          // Record prometheus metrics
          this.obsService.apiRequestCount.inc({
            method,
            path,
            status: statusCode.toString(),
          });
          this.obsService.apiRequestDuration.observe(
            { method, path },
            duration,
          );
          this.obsService.apiActiveRequests.dec();

          // Structured JSON log output
          this.logJson(req, statusCode, duration * 1000);
        },
        error: (err: any) => {
          const duration = (Date.now() - start) / 1000;
          const statusCode = err.status || 500;

          // Record prometheus metrics on failure
          this.obsService.apiRequestCount.inc({
            method,
            path,
            status: statusCode.toString(),
          });
          this.obsService.apiRequestDuration.observe(
            { method, path },
            duration,
          );
          this.obsService.apiActiveRequests.dec();

          this.logJson(req, statusCode, duration * 1000, err);
        },
      }),
    );
  }

  private logJson(req: any, status: number, durationMs: number, error?: any) {
    const activeSpan = trace.getActiveSpan();
    const traceId = activeSpan ? activeSpan.spanContext().traceId : undefined;

    // Scopes
    const tenantId =
      req.user?.tenantId || req.headers['x-tenant-id'] || 'DEFAULT_TENANT';
    const userId = req.user?.id || 'anonymous';
    const userRole = req.user?.role || 'none';

    const logEntry = {
      timestamp: new Date().toISOString(),
      level: status >= 500 ? 'ERROR' : status >= 400 ? 'WARN' : 'INFO',
      message: `${req.method} ${req.url} completed with status ${status} in ${durationMs.toFixed(2)}ms`,
      http: {
        method: req.method,
        url: req.url,
        status,
        duration_ms: Math.round(durationMs),
        ip: req.ip || req.connection.remoteAddress,
        user_agent: req.headers['user-agent'],
      },
      observability: {
        trace_id: traceId,
        request_id: req.id,
      },
      tenant: {
        id: tenantId,
      },
      user: {
        id: userId,
        role: userRole,
      },
      error: error
        ? {
            message: error.message,
            stack: error.stack,
          }
        : undefined,
    };

    console.log(JSON.stringify(logEntry));
  }
}
