import { Module } from '@nestjs/common';
import { IdempotencyService } from './idempotency.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [IdempotencyService],
  exports: [IdempotencyService],
})
export class IdempotencyModule {}
