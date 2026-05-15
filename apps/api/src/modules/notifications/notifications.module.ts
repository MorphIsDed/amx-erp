import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationsController } from './notifications.controller';
import { NotificationListener } from './notification.listener';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NotificationsController],
  providers: [NotificationService, NotificationListener],
  exports: [NotificationService],
})
export class NotificationsModule {}
