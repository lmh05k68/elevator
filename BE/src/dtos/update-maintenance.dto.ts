import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { MaintenanceStatus } from '../entities/maintenance.entity';

export class UpdateMaintenanceDto {
  @IsEnum(MaintenanceStatus)
  @IsNotEmpty()
  status: MaintenanceStatus;

  @IsString()
  @IsOptional()
  notes?: string; 
}