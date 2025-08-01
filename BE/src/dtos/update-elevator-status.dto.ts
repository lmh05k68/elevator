import { IsEnum, IsNotEmpty } from 'class-validator';
import { ElevatorStatus } from '../entities/elevator.entity';

export class UpdateElevatorStatusDto {
  @IsEnum(ElevatorStatus)
  @IsNotEmpty()
  status: ElevatorStatus;
}