import {
  Controller,
  Get,
  UseGuards,
  Request,
  Query,
  Sse,
} from '@nestjs/common';
import { map, filter } from 'rxjs/operators';
import { ActivityService } from './activity.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Audit & Activity')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  @ApiOperation({ summary: 'Get activity logs for current tenant' })
  findAll(@Request() req: any, @Query('limit') limit?: number) {
    return this.activityService.findByTenant(req.user.tenantId, limit);
  }

  @Sse('stream')
  @ApiOperation({ summary: 'Real-time activity audit stream (SSE)' })
  stream(@Request() req: any) {
    return this.activityService.getStream().pipe(
      filter((data: any) => data.tenantId === req.user.tenantId),
      map((data: any) => ({ data: data.activity })),
    );
  }
}
