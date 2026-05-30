import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { DataLoaderService } from './dataloader.service';

@Module({
  imports: [PrismaModule],
  providers: [DataLoaderService],
  exports: [DataLoaderService],
})
export class DataLoaderModule {}
