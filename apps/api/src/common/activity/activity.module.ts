import { Global, Module } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ActivityListener } from './activity.listener';
import { ActivityController } from './activity.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  controllers: [ActivityController],
  providers: [ActivityService, ActivityListener],
  exports: [ActivityService],
})
export class ActivityModule {}
