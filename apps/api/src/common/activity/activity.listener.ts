import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ActivityService } from './activity.service';

@Injectable()
export class ActivityListener {
  constructor(private activityService: ActivityService) {}

  @OnEvent('**', { async: true })
  async handleAllEvents(payload: any, event: string) {
    // Only log events that have tenantId and meet a certain pattern
    if (payload?.tenantId && (event.includes('.created') || event.includes('.updated') || event.includes('.deleted') || event.includes('.paid'))) {
      await this.activityService.log({
        action: event.toUpperCase().replace('.', '_'),
        entityType: event.split('.')[0].toUpperCase(),
        entityId: payload.id,
        details: payload,
        userId: payload.userId || payload.adminId,
        tenantId: payload.tenantId,
      });
    }
  }
}
