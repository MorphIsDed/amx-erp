import { Module } from '@nestjs/common';
import { TenantsService } from './tenant.service';
import { TenantsController } from './tenant.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TenantsController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}
