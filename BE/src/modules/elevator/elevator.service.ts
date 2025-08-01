// BE/src/modules/elevator/elevator.service.ts

import { Injectable, Logger, OnModuleInit, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Elevator, ElevatorStatus, Direction } from '../../entities/elevator.entity';
import { CreateElevatorDto } from '../../dtos/create-elevator.dto';
import { CreateRequestDto } from '../../dtos/create-request.dto';
import { EventsGateway } from '../../events/events.gateway'; 
import { MaintenanceService } from '../maintenance/maintenance.service';

interface ElevatorSimState extends Elevator {
  lastActionTimestamp: number;
  passengerExchangeDone: boolean;
}

@Injectable()
export class ElevatorService implements OnModuleInit {
  private readonly logger = new Logger(ElevatorService.name);
  private elevatorsState: Map<string, ElevatorSimState> = new Map();
  private readonly simulationInterval: number;
  private readonly timePerFloor: number;
  private readonly timeDoorOpen: number;
  private readonly minFloors: number;
  private readonly maxFloors: number;

  constructor(
    @InjectRepository(Elevator)
    private readonly elevatorRepository: Repository<Elevator>,
    private readonly configService: ConfigService,
    private readonly eventsGateway: EventsGateway,
    @Inject(forwardRef(() => MaintenanceService))
    private readonly maintenanceService: MaintenanceService
  ) {
    this.simulationInterval = this.configService.get<number>('SIMULATION_INTERVAL_MS', 1000);
    this.timePerFloor = this.configService.get<number>('TIME_PER_FLOOR_MS', 3000);
    this.timeDoorOpen = this.configService.get<number>('TIME_DOOR_OPEN_MS', 5000);
    this.minFloors = Number(this.configService.get<string>('MIN_FLOORS', '-3'));
    this.maxFloors = Number(this.configService.get<string>('MAX_FLOORS', '50'));
  }

  async onModuleInit() {
    await this.loadStateFromDatabase();
    this.startSimulation();
  }

  private startSimulation() {
    this.logger.log(`Simulation loop started with interval: ${this.simulationInterval}ms.`);
    setInterval(() => this.simulationTick(), this.simulationInterval);
  }

  public async updateState(id: string, updates: Partial<ElevatorSimState>) {
    const elevator = this.elevatorsState.get(id);
    if (!elevator) return;
    if (updates.status && updates.status !== elevator.status) {
      if (updates.status === ElevatorStatus.MAINTENANCE || updates.status === ElevatorStatus.ERROR) {
        const desc = updates.status === ElevatorStatus.MAINTENANCE ? 'Chuyển sang chế độ bảo trì.' : 'Thang máy gặp sự cố.';
        await this.maintenanceService.createLogFromStatusChange(elevator, updates.status, desc);
      }
    }
    const newState = { ...elevator, ...updates };
    this.elevatorsState.set(id, newState);
    this.eventsGateway.sendElevatorUpdate(newState);
    const importantUpdates: Partial<Elevator> = {
        status: updates.status, currentFloor: updates.currentFloor,
        direction: updates.direction, targetFloors: updates.targetFloors,
        currentLoad: updates.currentLoad,
    };
    const definedUpdates = Object.entries(importantUpdates).reduce((acc, [key, value]) => {
        if (value !== undefined) { acc[key] = value; }
        return acc;
    }, {});
    if (Object.keys(definedUpdates).length > 0) {
        this.persistState(id, definedUpdates);
    }
  }

  async create(createElevatorDto: CreateElevatorDto): Promise<Elevator> {
    const newElevator = this.elevatorRepository.create(createElevatorDto);
    const savedElevator = await this.elevatorRepository.save(newElevator);
    const initialState: ElevatorSimState = {
      ...savedElevator,
      lastActionTimestamp: Date.now(),
      passengerExchangeDone: true, 
    };
    this.elevatorsState.set(savedElevator.id, initialState);
    this.logger.log(`New elevator "${savedElevator.name}" created and added to simulation.`);
    this.eventsGateway.sendNewElevator(initialState);
    return savedElevator;
  }
  
  async findAll(): Promise<Elevator[]> {
    return this.elevatorRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Elevator> {
    const elevator = await this.elevatorRepository.findOne({ where: { id } });
    if (!elevator) throw new NotFoundException(`Elevator with ID "${id}" not found`);
    return elevator;
  }

  findAllAvailable(): Elevator[] { 
    return Array.from(this.elevatorsState.values()).filter(e => e.status !== ElevatorStatus.MAINTENANCE && e.status !== ElevatorStatus.ERROR); 
  }
  
  async assignRequestToElevator(elevatorId: string, request: CreateRequestDto): Promise<void> {
    const elevator = this.elevatorsState.get(elevatorId);
    if (!elevator) return;
    const newTargets = new Set([...elevator.targetFloors, request.fromFloor, request.toFloor]);
    this.updateState(elevator.id, { targetFloors: Array.from(newTargets) });
  }
  
  private simulationTick() {
    const now = Date.now();
    this.elevatorsState.forEach((elevator) => {
      if (elevator.status === ElevatorStatus.MAINTENANCE || elevator.status === ElevatorStatus.ERROR) return;
      switch (elevator.status) {
        case ElevatorStatus.IDLE: this.handleIdleState(elevator, now); break;
        case ElevatorStatus.MOVING: this.handleMovingState(elevator, now); break;
        case ElevatorStatus.STOPPED: 
          this.updateState(elevator.id, { 
            status: ElevatorStatus.DOOR_OPEN, 
            lastActionTimestamp: now,
            passengerExchangeDone: false
          }); 
          break;
        case ElevatorStatus.DOOR_OPEN: this.handleDoorOpenState(elevator, now); break;
        case ElevatorStatus.DOOR_CLOSED: this.updateState(elevator.id, { status: ElevatorStatus.IDLE }); break;
      }
    });
  }

 private handleIdleState(elevator: ElevatorSimState, now: number) {
    if (elevator.targetFloors.length > 0) {
      this.sortTargetFloors(elevator);
      const nextTarget = elevator.targetFloors[0];
      if (nextTarget === elevator.currentFloor) {
        this.updateState(elevator.id, { status: ElevatorStatus.STOPPED, targetFloors: elevator.targetFloors.slice(1), lastActionTimestamp: now });
        return;
      }
      const newDirection = nextTarget > elevator.currentFloor ? Direction.UP : Direction.DOWN;
      this.updateState(elevator.id, { status: ElevatorStatus.MOVING, direction: newDirection });
    }
  }

  private handleMovingState(elevator: ElevatorSimState, now: number) {
    if (now - elevator.lastActionTimestamp < this.timePerFloor) return;
    const nextFloor = elevator.currentFloor + (elevator.direction === Direction.UP ? 1 : -1);
    const updates: Partial<ElevatorSimState> = { currentFloor: nextFloor, lastActionTimestamp: now };
    if (elevator.targetFloors.includes(nextFloor)) {
      updates.status = ElevatorStatus.STOPPED;
      updates.targetFloors = elevator.targetFloors.filter(f => f !== nextFloor);
    }
    this.updateState(elevator.id, updates);
  }

   private handleDoorOpenState(elevator: ElevatorSimState, now: number) {
    if (!elevator.passengerExchangeDone) {
      let currentLoad = elevator.currentLoad;
      const peopleExiting = Math.floor(Math.random() * (currentLoad + 1));
      currentLoad = Math.max(0, currentLoad - peopleExiting);
      if (peopleExiting > 0) { this.logger.log(`[${elevator.name}] ${peopleExiting} người ra tại tầng ${elevator.currentFloor}. Còn lại: ${currentLoad}`); }
      const availableSpace = elevator.capacity - currentLoad;
      if (availableSpace > 0) {
        const peopleEntering = Math.floor(Math.random() * (availableSpace / 2 + 1));
        currentLoad += peopleEntering;
        if (peopleEntering > 0) { this.logger.log(`[${elevator.name}] ${peopleEntering} người vào tại tầng ${elevator.currentFloor}. Tổng: ${currentLoad}`); }
      }
      this.updateState(elevator.id, { 
        currentLoad: currentLoad,
        passengerExchangeDone: true
      });
    }
    if (now - elevator.lastActionTimestamp >= this.timeDoorOpen) {
      this.updateState(elevator.id, { status: ElevatorStatus.DOOR_CLOSED, lastActionTimestamp: now });
    }
  }

  private sortTargetFloors(elevator: ElevatorSimState): void { /* Giữ nguyên, đã đúng */ }

  // =========================================================
  // === SỬA LỖI: HÀM NÀY PHẢI KHỞI TẠO ĐẦY ĐỦ ElevatorSimState ===
  // =========================================================
  private async loadStateFromDatabase() {
      const elevators = await this.elevatorRepository.find();
      elevators.forEach(e => {
          // Tạo đối tượng SimState đầy đủ, bao gồm cả các thuộc tính mô phỏng
          const simState: ElevatorSimState = {
            ...e, // Lấy tất cả thuộc tính từ đối tượng Elevator trong DB
            lastActionTimestamp: Date.now(),
            passengerExchangeDone: true, // Khởi tạo cờ
          };
          this.elevatorsState.set(e.id, simState);
      });
      this.logger.log(`Loaded ${this.elevatorsState.size} elevators from database into state.`);
  }

  private async persistState(id: string, updates: Partial<Elevator>) {
      if (Object.keys(updates).length === 0) return;
      try {
          await this.elevatorRepository.update(id, updates);
      } catch (error) {
          this.logger.error(`Failed to persist state for elevator ${id}:`, error);
      }
  }
}