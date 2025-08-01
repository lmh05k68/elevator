// BE/src/modules/maintenance/maintenance.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceController } from './maintenance.controller';
import { Maintenance } from '../../entities/maintenance.entity';
import { ElevatorModule } from '../elevator/elevator.module'; // SỬA LỖI: Import toàn bộ ElevatorModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Maintenance]), // Module này chỉ quản lý Maintenance entity
    ElevatorModule, // SỬA LỖI: Bằng cách import ElevatorModule, tất cả các service đã export từ nó sẽ có sẵn để inject
  ],
  controllers: [MaintenanceController],
  // SỬA LỖI: Chỉ cung cấp service của chính module này
  providers: [MaintenanceService], 
})
export class MaintenanceModule {}