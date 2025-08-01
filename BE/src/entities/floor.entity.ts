import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Floor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  floorNumber: number;

  @Column({ nullable: true })
  name: string; 

  @Column({ default: true })
  isAccessible: boolean;
}