// src/entities/elevator.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum ElevatorStatus {
  IDLE = 'Idle',
  MOVING = 'Moving',
  STOPPED = 'Stopped',
  DOOR_OPEN = 'DoorOpen',
  DOOR_CLOSED = 'DoorClosed',
  MAINTENANCE = 'Maintenance',
  OVERLOADED = 'Overloaded',
  ERROR = 'Error',
}

export enum Direction {
  UP = 'Up',
  DOWN = 'Down',
  IDLE = 'Idle',
}

@Entity()
export class Elevator {
  @PrimaryGeneratedColumn('uuid') // Sử dụng UUID cho ID duy nhất
  id: string;

  @Column()
  name: string;

  @Column({ default: 1 }) // Tầng mặc định ban đầu
  currentFloor: number;

  @Column({
    type: 'enum',
    enum: Direction,
    default: Direction.IDLE,
  })
  direction: Direction;

  @Column({
    type: 'enum',
    enum: ElevatorStatus,
    default: ElevatorStatus.IDLE,
  })
  status: ElevatorStatus;

  @Column({ default: false })
  isDoorOpen: boolean;

  @Column({ default: 0 })
  currentLoad: number;

  @Column({ default: 10 }) 
  capacity: number;

  @Column('int', { array: true, default: [] }) // Dùng kiểu mảng của PostgreSQL
  targetFloors: number[];
}