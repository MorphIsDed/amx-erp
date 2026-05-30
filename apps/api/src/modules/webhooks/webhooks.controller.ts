import { Controller, Get, Post, Delete, UseGuards, Request, Body, Param } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

class SubscribeDto {
  url: string;
  secret: string;
  eventTypes: string[];
}

@ApiTags('Outbound Webhooks Engine')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('subscribe')
  @ApiOperation({ summary: 'Register a new webhook subscription' })
  subscribe(@Request() req: any, @Body() dto: SubscribeDto) {
    return this.webhooksService.subscribe(req.user.tenantId, dto.url, dto.secret, dto.eventTypes);
  }

  @Get('subscriptions')
  @ApiOperation({ summary: 'List all active webhook subscriptions for the tenant' })
  getSubscriptions(@Request() req: any) {
    return this.webhooksService.getSubscriptions(req.user.tenantId);
  }

  @Delete('unsubscribe/:id')
  @ApiOperation({ summary: 'Deactivate a webhook subscription' })
  unsubscribe(@Request() req: any, @Param('id') id: string) {
    return this.webhooksService.unsubscribe(req.user.tenantId, id);
  }
}
