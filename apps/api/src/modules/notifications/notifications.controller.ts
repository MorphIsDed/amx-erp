import {
  Controller,
  Get,
  Param,
  Patch,
  Sse,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { map, filter } from 'rxjs/operators';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications for current user' })
  findAll(@Request() req: any) {
    return this.notificationService.findAll(req.user.tenantId, req.user.userId);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notifications count' })
  getUnreadCount(@Request() req: any) {
    return this.notificationService.getUnreadCount(
      req.user.tenantId,
      req.user.userId,
    );
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  markAsRead(@Request() req: any, @Param('id') id: string) {
    return this.notificationService.markAsRead(
      req.user.tenantId,
      req.user.userId,
      id,
    );
  }

  @Sse('stream')
  @ApiOperation({ summary: 'Real-time notification stream (SSE)' })
  stream(@Request() req: any) {
    return this.notificationService.getStream().pipe(
      filter(
        (data) =>
          data.userId === req.user.userId &&
          data.tenantId === req.user.tenantId,
      ),
      map((data) => ({ data: data.notification })),
    );
  }
}
