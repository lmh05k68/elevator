// BE/src/modules/elevator/elevator.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Elevator } from '../../entities/elevator.entity';
import {EventsModule} from '../../events/events.module' 
import { ElevatorController } from './elevator.controller';
import { ElevatorService } from './elevator.service';
import { AlgorithmService } from './algorithm.service';
import { RequestGeneratorService } from './requestGenerator.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Elevator]),
    EventsModule
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