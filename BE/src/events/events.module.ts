// BE/src/events/events.module.ts

import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';

@Module({
  providers: [EventsGateway],
  // Export EventsGateway để các module khác (như ElevatorModule) có thể inject nó
  exports: [EventsGateway],
})
export class EventsModule {}