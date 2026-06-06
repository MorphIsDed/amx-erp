import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { trace } from '@opentelemetry/api';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { id?: string; user?: any }>();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: unknown = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : isRecord(exceptionResponse) && 'message' in exceptionResponse
            ? exceptionResponse.message
            : exceptionResponse;
    }

    const activeSpan = trace.getActiveSpan();
    const traceId = activeSpan ? activeSpan.spanContext().traceId : undefined;

    // Structured JSON log for exception
    const errorLog = {
      timestamp: new Date().toISOString(),
      level: status >= 500 ? 'ERROR' : 'WARN',
      message: `Exception caught: ${String(message)}`,
      http: {
        method: request.method,
        url: request.url,
        status,
      },
      observability: {
        trace_id: traceId,
        request_id: request.id,
      },
      tenant: {
        id: request.user?.tenantId || 'anonymous',
      },
      error:
        exception instanceof Error
          ? {
              message: exception.message,
              stack: exception.stack,
            }
          : {
              message: String(message),
            },
    };

    console.log(JSON.stringify(errorLog));

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
