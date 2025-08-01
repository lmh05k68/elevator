// BE/src/modules/maintenance/maintenance.module.ts

import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceController } from './maintenance.controller';
import { MaintenanceLog } from '../../entities/maintenance.entity';
import { ElevatorModule } from '../elevator/elevator.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MaintenanceLog]),
    forwardRef(() => ElevatorModule), 
  ],
  controllers: [MaintenanceController],
  providers: [MaintenanceService],
  // SỬA LỖI: Export service để các module khác (ElevatorModule) có thể inject nó
  exports: [MaintenanceService],
})
export class MaintenanceModule {}