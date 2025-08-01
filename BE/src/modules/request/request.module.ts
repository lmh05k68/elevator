// BE/src/modules/request/request.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestService } from './request.service';
import { RequestController } from './request.controller';
import { Request } from '../../entities/request.entity';
import { ElevatorModule } from '../elevator/elevator.module'; // Import là đúng

@Module({
  imports: [
    TypeOrmModule.forFeature([Request]),
    ElevatorModule, // Import ElevatorModule để có thể inject AlgorithmService
  ],
  controllers: [RequestController],
  providers: [RequestService],
})
export class RequestModule {}