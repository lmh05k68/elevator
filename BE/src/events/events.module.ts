import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';

@Module({
  providers: [EventsGateway],
  exports: [EventsGateway], // <-- QUAN TRỌNG: Export để các module khác có thể dùng
})
export class EventsModule {}