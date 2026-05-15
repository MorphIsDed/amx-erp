import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
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
}
