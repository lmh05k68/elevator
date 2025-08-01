import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum RequestStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'InProgress',
  COMPLETED = 'Completed',
}

@Entity()
export class Request {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fromFloor: number;

  @Column()
  toFloor: number;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.PENDING,
  })
  status: RequestStatus;
  
  @CreateDateColumn()
  createdAt: Date;
}