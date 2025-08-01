// BE/src/modules/maintenance/maintenance.service.ts

// SỬA LỖI 1: Import NotFoundException và Logger từ @nestjs/common
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Maintenance, MaintenanceStatus } from '../../entities/maintenance.entity';

// SỬA LỖI 2: Thêm 'Direction' vào danh sách import
import { Elevator, ElevatorStatus, Direction } from '../../entities/elevator.entity';
import { CreateMaintenanceDto } from '../../dtos/create-maintenance-log.dto';
import { UpdateMaintenanceDto } from '../../dtos/update-maintenance.dto';
import { ElevatorService } from '../elevator/elevator.service';

@Injectable()
export class MaintenanceService {
  private readonly logger = new Logger(MaintenanceService.name);

  constructor(
    @InjectRepository(Maintenance)
    private readonly maintenanceRepository: Repository<Maintenance>,
    private readonly elevatorService: ElevatorService,
  ) {}

  async create(createMaintenanceDto: CreateMaintenanceDto): Promise<Maintenance> {
    const { elevatorId, description, reportedBy } = createMaintenanceDto;
    const elevator = await this.elevatorService.findOne(elevatorId);

    this.logger.log(`Putting elevator ${elevator.name} (ID: ${elevatorId}) into maintenance.`);
    
    // Sử dụng hàm public updateState để thay đổi trạng thái và xóa các yêu cầu
    this.elevatorService.updateState(elevatorId, { 
        status: ElevatorStatus.MAINTENANCE,
        targetFloors: [], // Xóa hết các yêu cầu đang chờ
        direction: Direction.IDLE, // Đặt hướng về IDLE
    });

    const newMaintenanceLog = this.maintenanceRepository.create({
      elevator,
      description,
      reportedBy,
      status: MaintenanceStatus.PENDING,
    });

    return this.maintenanceRepository.save(newMaintenanceLog);
  }

  async findAll(): Promise<Maintenance[]> {
    return this.maintenanceRepository.find({ 
        relations: ['elevator'], 
        order: { createdAt: 'DESC' } 
    });
  }

  async findOne(id: string): Promise<Maintenance> {
    const maintenanceLog = await this.maintenanceRepository.findOne({ 
      where: { id },
      relations: ['elevator'],
    });

    if (!maintenanceLog) {
      // Khi throw exception này, NestJS sẽ trả về lỗi 404 cho client
      throw new NotFoundException(`Maintenance log with ID "${id}" not found`);
    }
    return maintenanceLog;
  }

  async update(id: string, updateMaintenanceDto: UpdateMaintenanceDto): Promise<Maintenance> {
    const maintenanceLog = await this.findOne(id); // Đã bao gồm elevator
    
    this.maintenanceRepository.merge(maintenanceLog, updateMaintenanceDto);
    
    if (updateMaintenanceDto.status === MaintenanceStatus.COMPLETED && maintenanceLog.elevator) {
      const { id: elevatorId, name: elevatorName } = maintenanceLog.elevator;
      this.logger.log(`Elevator ${elevatorName} (ID: ${elevatorId}) maintenance completed. Setting status to IDLE.`);
      this.elevatorService.updateState(elevatorId, { status: ElevatorStatus.IDLE });
    }
    
    return this.maintenanceRepository.save(maintenanceLog);
  }
}