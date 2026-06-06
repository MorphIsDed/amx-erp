import { Module, Global } from '@nestjs/common';
import { ObservabilityService } from './observability.service';
import { ObservabilityController } from './observability.controller';

@Global()
@Module({
  providers: [ObservabilityService],
  controllers: [ObservabilityController],
  exports: [ObservabilityService],
})
export class ObservabilityModule {}
