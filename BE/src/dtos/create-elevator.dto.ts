import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateElevatorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(1)
  capacity: number; 
}