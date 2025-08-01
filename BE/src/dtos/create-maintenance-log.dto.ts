import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateMaintenanceDto {
  @IsUUID()
  @IsNotEmpty()
  elevatorId: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  reportedBy?: string; 
}