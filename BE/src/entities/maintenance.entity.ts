import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Elevator } from './elevator.entity';

export enum MaintenanceStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'InProgress',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

@Entity()
export class Maintenance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Elevator, { eager: true }) // eager: true để tự động load thông tin thang máy khi query
  elevator: Elevator;

  @Column()
  description: string;

  @Column({ nullable: true })
  reportedBy: string;

  @Column({
    type: 'enum',
    enum: MaintenanceStatus,
    default: MaintenanceStatus.PENDING,
  })
  status: MaintenanceStatus;

  @Column({ type: 'text', nullable: true })
  notes: string; 

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}