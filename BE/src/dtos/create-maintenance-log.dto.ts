// BE/src/dtos/create-maintenance-log.dto.ts

import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';

// Đổi tên class để khớp với controller
export class CreateMaintenanceLogDto {
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