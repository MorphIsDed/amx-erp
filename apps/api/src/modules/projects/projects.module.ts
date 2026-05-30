import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { MilestonesController } from './milestones.controller';
import { TasksController } from './tasks.controller';
import { ProjectsService } from './projects.service';
import { MilestonesService } from './milestones.service';
import { TasksService } from './tasks.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [ProjectsController, MilestonesController, TasksController],
  providers: [ProjectsService, MilestonesService, TasksService],
  exports: [ProjectsService, MilestonesService, TasksService],
})
export class ProjectsModule {}
