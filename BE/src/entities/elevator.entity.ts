// BE/src/entities/elevator.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { MaintenanceLog } from './maintenance.entity';

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

// === SỬA LỖI: CHỈ ĐỊNH RÕ TÊN BẢNG LÀ 'elevator' ===
@Entity('elevator') // Luôn sử dụng bảng này, không bao giờ tạo bảng 'elevators'
export class Elevator {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ default: 1 })
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

  @Column({ default: 0 })
  currentLoad: number;

  @Column({ default: 10 }) 
  capacity: number;

  @Column('int', { array: true, default: [] })
  targetFloors: number[];

  @OneToMany(() => MaintenanceLog, (maintenanceLog) => maintenanceLog.elevator)
  maintenanceLogs: MaintenanceLog[];
}