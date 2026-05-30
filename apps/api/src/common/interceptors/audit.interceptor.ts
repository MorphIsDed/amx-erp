import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, body, params } = request;

    if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      return next.handle();
    }

    const tenantId = user?.tenantId;
    const userId = user?.id;

    if (!tenantId) return next.handle();

    let entityType = '';
    let entityId = params?.id || body?.id || '';
    let previousValues: any = null;

    const pathSegments = url.split('/');
    const resource = pathSegments.find((seg: string) =>
      ['invoices', 'employees', 'products', 'purchase-orders', 'accounts', 'leaves', 'payroll', 'projects', 'milestones', 'tasks'].includes(seg)
    );

    if (resource) {
      entityType = resource.toUpperCase().replace('-', '_');
      if (entityId && ['PUT', 'PATCH', 'DELETE'].includes(method)) {
        try {
          // Normalize model name (e.g. purchase-orders -> purchaseOrder, payroll -> payrollRun)
          let dbName = resource.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
          if (dbName.endsWith('s')) {
            dbName = dbName.slice(0, -1);
          }
          if (dbName === 'payroll') {
            dbName = 'payrollRun';
          }

          const delegate = (this.prisma as any)[dbName];
          if (delegate) {
            previousValues = await delegate.findFirst({ where: { id: entityId, tenantId } });
          }
        } catch (e) {
          // Ignore
        }
      }
    }

    return next.handle().pipe(
      tap(async (response) => {
        try {
          const finalEntityId = entityId || response?.id || '';
          const action = `${method}_${entityType || 'UNKNOWN'}`;

          await this.prisma.activityLog.create({
            data: {
              action,
              entityType: entityType || 'SYSTEM',
              entityId: finalEntityId,
              userId,
              tenantId,
              details: {
                url,
                method,
                previousValues: previousValues || {},
                newValues: body || {},
              },
            },
          });
        } catch (err) {
          console.error('Failed to log audit activity:', err);
        }
      }),
    );
  }
}
