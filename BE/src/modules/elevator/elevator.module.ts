// BE/src/modules/elevator/elevator.module.ts

import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsModule } from '../../events/events.module';
import { MaintenanceModule } from '../maintenance/maintenance.module';
import { RequestModule } from '../request/request.module'; // <-- IMPORT REQUEST MODULE
import { Elevator } from '../../entities/elevator.entity';
import { ElevatorService } from './elevator.service';
import { AlgorithmService } from './algorithm.service';
import { RequestGeneratorService } from './requestGenerator.service';
import { ElevatorController } from './elevator.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Elevator]),
    EventsModule,
    forwardRef(() => MaintenanceModule),
    forwardRef(() => RequestModule), 
  ],
  controllers: [ElevatorController],
  providers: [
    ElevatorService,
    AlgorithmService,
    RequestGeneratorService,
  ],
  exports: [ElevatorService, AlgorithmService],
})
export class ElevatorModule {}