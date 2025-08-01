// src/modules/elevator/algorithm.service.ts

import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Elevator, ElevatorStatus } from '../../entities/elevator.entity';
import { ElevatorService } from './elevator.service';
import { CreateRequestDto } from '../../dtos/create-request.dto';

@Injectable()
export class AlgorithmService implements OnModuleInit {
  private readonly logger = new Logger(AlgorithmService.name);
  private requestQueue: CreateRequestDto[] = [];
  private isProcessing = false;

  constructor(private readonly elevatorService: ElevatorService) {}

  onModuleInit() {
    setInterval(() => this.processRequestQueue(), 2000);
  }

  public addRequest(request: CreateRequestDto) {
    if (request.fromFloor === request.toFloor) return;
    this.requestQueue.push(request);
    this.logger.log(`[QUEUE] Request added: ${request.fromFloor}->${request.toFloor}. Queue size: ${this.requestQueue.length}`);
  }

  private async processRequestQueue() {
    if (this.requestQueue.length === 0 || this.isProcessing) return;

    this.isProcessing = true;
    const request = this.requestQueue.shift();

    try {
      const allAvailableElevators = this.elevatorService.findAllAvailable();
      if (allAvailableElevators.length === 0) {
        this.requeueRequest(request, "No available elevators at all.");
        return;
      }

      const idleElevators = allAvailableElevators.filter(e => e.status === ElevatorStatus.IDLE);
      let bestElevator: Elevator = null;

      if (idleElevators.length > 0) {
        idleElevators.sort((a, b) => 
            Math.abs(a.currentFloor - request.fromFloor) - Math.abs(b.currentFloor - request.fromFloor)
        );
        bestElevator = idleElevators[0];
        this.logger.log(`[ALGORITHM] Idle elevator ${bestElevator.name} is closest for request ${request.fromFloor}->${request.toFloor}.`);
      } else {
        allAvailableElevators.sort((a, b) => a.targetFloors.length - b.targetFloors.length);
        bestElevator = allAvailableElevators[0];
        this.logger.log(`[ALGORITHM] All elevators are busy. Assigning to ${bestElevator.name} (has ${bestElevator.targetFloors.length} targets).`);
      }

      await this.elevatorService.assignRequestToElevator(bestElevator.id, request);
    } catch (error) {
      this.logger.error(`Error processing request: ${error.message}`, error.stack);
      this.requeueRequest(request, "Error occurred.");
    } finally {
        this.isProcessing = false;
    }
  }
  private requeueRequest(request: CreateRequestDto, reason: string) {
    this.requestQueue.unshift(request);
    this.logger.warn(`[QUEUE] Re-queueing request ${request.fromFloor}->${request.toFloor}. Reason: ${reason}`);
  }
}