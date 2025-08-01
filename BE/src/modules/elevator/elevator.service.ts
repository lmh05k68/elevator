// src/elevator/elevator.service.ts

import { Injectable, Logger, OnModuleInit, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Elevator, ElevatorStatus, Direction } from '../../entities/elevator.entity';
import { CreateElevatorDto } from '../../dtos/create-elevator.dto';
import { CreateRequestDto } from '../../dtos/create-request.dto';
import { EventsGateway } from '../../events/events.gateway'; // <-- CHÚNG TA CHỈ DÙNG GATEWAY NÀY

interface ElevatorSimState extends Elevator {
  lastActionTimestamp: number;
}

// Bỏ các hằng số không dùng
// const TIME_TO_RESET_ERROR_MS = 10000;

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
    // === BƯỚC 1: SỬA CONSTRUCTOR ===
    // Chỉ inject EventsGateway, bỏ ElevatorGateway đi
    private readonly eventsGateway: EventsGateway
  ) {
    this.simulationInterval = this.configService.get<number>('SIMULATION_INTERVAL_MS', 1000);
    this.timePerFloor = this.configService.get<number>('TIME_PER_FLOOR_MS', 3000);
    this.timeDoorOpen = this.configService.get<number>('TIME_DOOR_OPEN_MS', 3000);
    this.minFloors = this.configService.get<number>('MIN_FLOORS', -3);
    this.maxFloors = this.configService.get<number>('MAX_FLOORS', 50);
  }

  async onModuleInit() {
    await this.loadStateFromDatabase();
    this.startSimulation();
  }

  private startSimulation() {
    this.logger.log(`Simulation loop started with interval: ${this.simulationInterval}ms.`);
    setInterval(() => this.simulationTick(), this.simulationInterval);
  }

  // --- HÀM CÔNG KHAI (PUBLIC API) ---
  
  public updateState(id: string, updates: Partial<ElevatorSimState>) {
    const elevator = this.elevatorsState.get(id);
    if (!elevator) {
      this.logger.warn(`Attempted to update a non-existent elevator state with ID: ${id}`);
      return;
    }

    const newState = { ...elevator, ...updates };
    this.elevatorsState.set(id, newState);
    
    // === BƯỚC 2: LOGGING VÀ GỬI DỮ LIỆU ===
    this.logger.debug(`State Update for ${newState.name}:`, updates);

    // Sử dụng EventsGateway đã được inject
    // Đảm bảo tên sự kiện 'elevator_update' khớp với frontend
    this.eventsGateway.sendElevatorUpdate(newState);

    const importantUpdates = { 
      status: updates.status, 
      currentFloor: updates.currentFloor, 
      direction: updates.direction, 
      targetFloors: updates.targetFloors 
    };

    if (Object.values(importantUpdates).some(v => v !== undefined)) {
      this.persistState(id, importantUpdates);
    }
  }

  async create(createElevatorDto: CreateElevatorDto): Promise<Elevator> {
    const newElevator = this.elevatorRepository.create(createElevatorDto);
    const savedElevator = await this.elevatorRepository.save(newElevator);
    const initialState: ElevatorSimState = { ...savedElevator, lastActionTimestamp: Date.now() };

    this.elevatorsState.set(savedElevator.id, initialState);
    this.logger.log(`New elevator "${savedElevator.name}" created and added to simulation.`);

    // === BƯỚC 3: GỬI SỰ KIỆN TẠO MỚI ===
    // Tạo một hàm riêng trong EventsGateway để gửi sự kiện này
    this.eventsGateway.sendNewElevator(initialState);

    return savedElevator;
  }
  
  async findAll(): Promise<Elevator[]> { return this.elevatorRepository.find({ order: { name: 'ASC' } }); }

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
  
  // --- LOGIC MÔ PHỎNG (PRIVATE) ---

  private simulationTick() {
    this.elevatorsState.forEach((elevator) => {
      // Bỏ qua logic nếu không có sự thay đổi
      const now = Date.now();
      switch (elevator.status) {
        case ElevatorStatus.IDLE: 
          this.handleIdleState(elevator, now); 
          break;
        case ElevatorStatus.MOVING: 
          this.handleMovingState(elevator, now); 
          break;
        case ElevatorStatus.STOPPED: 
          this.updateState(elevator.id, { status: ElevatorStatus.DOOR_OPEN, lastActionTimestamp: now }); 
          break;
        case ElevatorStatus.DOOR_OPEN: 
          this.handleDoorOpenState(elevator, now); 
          break;
        case ElevatorStatus.DOOR_CLOSED: 
          this.updateState(elevator.id, { status: ElevatorStatus.IDLE, lastActionTimestamp: now }); 
          break;
        case ElevatorStatus.MAINTENANCE:
        case ElevatorStatus.ERROR:
          // Không làm gì trong tick cho 2 trạng thái này
          break;
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
      this.updateState(elevator.id, { status: ElevatorStatus.MOVING, direction: newDirection, lastActionTimestamp: now });
    }
    // Logic đi tuần tra (patrol) có thể bỏ nếu không cần thiết để đơn giản hóa
  }

  private handleMovingState(elevator: ElevatorSimState, now: number) {
    if (now - elevator.lastActionTimestamp < this.timePerFloor) return; // Chưa đến lúc di chuyển

    const nextFloor = elevator.currentFloor + (elevator.direction === Direction.UP ? 1 : -1);
    if (nextFloor > this.maxFloors || nextFloor < this.minFloors) {
      this.logger.error(`[CRITICAL] Elevator ${elevator.name} attempted to move out of bounds to floor ${nextFloor}. Forcing to ERROR state.`);
      this.updateState(elevator.id, { status: ElevatorStatus.ERROR, targetFloors: [], direction: Direction.IDLE, lastActionTimestamp: now });
      return;
    }

    const updates: Partial<ElevatorSimState> = { currentFloor: nextFloor, lastActionTimestamp: now };
    if (elevator.targetFloors.includes(nextFloor)) {
      updates.status = ElevatorStatus.STOPPED;
      updates.targetFloors = elevator.targetFloors.filter(f => f !== nextFloor);
    }
    this.updateState(elevator.id, updates);
  }

  private handleDoorOpenState(elevator: ElevatorSimState, now: number) {
      if (now - elevator.lastActionTimestamp >= this.timeDoorOpen) {
          this.updateState(elevator.id, { status: ElevatorStatus.DOOR_CLOSED, lastActionTimestamp: now });
      }
  }

  private sortTargetFloors(elevator: ElevatorSimState): void {
      const currentFloor = elevator.currentFloor;
      const direction = elevator.direction;
      elevator.targetFloors.sort((a, b) => {
          if (direction === Direction.UP) {
              if (a > currentFloor && b > currentFloor) return a - b;
              if (a < currentFloor && b < currentFloor) return b - a;
              return a > currentFloor ? -1 : 1;
          }
          if (direction === Direction.DOWN) {
              if (a < currentFloor && b < currentFloor) return b - a;
              if (a > currentFloor && b > currentFloor) return a - b;
              return a < currentFloor ? -1 : 1;
          }
          return Math.abs(a - currentFloor) - Math.abs(b - currentFloor);
      });
  }

  private async loadStateFromDatabase() {
      const elevators = await this.elevatorRepository.find();
      elevators.forEach(e => {
          this.elevatorsState.set(e.id, { ...e, lastActionTimestamp: Date.now() });
      });
      this.logger.log(`Loaded ${this.elevatorsState.size} elevators from database into state.`);
  }

  private async persistState(id: string, updates: Partial<Elevator>) {
      try {
          await this.elevatorRepository.update(id, updates);
      } catch (error) {
          this.logger.error(`Failed to persist state for elevator ${id}:`, error);
      }
  }
}