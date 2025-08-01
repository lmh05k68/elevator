import {InternalServerErrorException} from '@nestjs/common/exceptions';
import { Injectable, NotFoundException, Logger, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository,DataSource } from 'typeorm';
import { MaintenanceLog, MaintenanceStatus } from '../../entities/maintenance.entity';
import { Elevator, ElevatorStatus, Direction} from '../../entities/elevator.entity';
import { CreateMaintenanceLogDto } from '../../dtos/create-maintenance-log.dto';
import { UpdateMaintenanceDto } from '../../dtos/update-maintenance.dto';
import { ElevatorService } from '../elevator/elevator.service';

@Injectable()
export class MaintenanceService {
  private readonly logger = new Logger(MaintenanceService.name);

  constructor(
    @InjectRepository(MaintenanceLog)
    private readonly maintenanceRepository: Repository<MaintenanceLog>,
    @Inject(forwardRef(() => ElevatorService))
    private readonly elevatorService: ElevatorService,
    private readonly dataSource: DataSource
  ) {}
  async create(createMaintenanceDto: CreateMaintenanceLogDto): Promise<MaintenanceLog> {
    const { elevatorId, description, reportedBy } = createMaintenanceDto;
    
    const elevator = await this.elevatorService.findOne(elevatorId);
    if (!elevator) {
        throw new NotFoundException(`Elevator with ID ${elevatorId} not found.`);
    }

    this.logger.log(`Creating manual maintenance log for elevator ${elevator.name} and putting it into maintenance.`);
    
    // Đặt thang máy vào trạng thái bảo trì
    this.elevatorService.updateState(elevatorId, { 
        status: ElevatorStatus.MAINTENANCE,
        targetFloors: [],
        direction: Direction.IDLE,
    });

    const newMaintenanceLog = this.maintenanceRepository.create({
      elevator,
      description,
      reportedBy,
      status: MaintenanceStatus.PENDING,
    });
    return this.maintenanceRepository.save(newMaintenanceLog);
  }

  // =========================================================
  // === SỬA LỖI: THÊM HÀM CÒN THIẾU VÀO ĐÂY ===
  // =========================================================
  /**
   * Tạo một bản ghi nhật ký mới một cách tự động khi trạng thái thang máy thay đổi.
   * @param elevator - Toàn bộ đối tượng thang máy.
   * @param newStatus - Trạng thái mới (MAINTENANCE hoặc ERROR).
   * @param description - Mô tả ngắn gọn.
   */
  async createLogFromStatusChange(elevator: Pick<Elevator, 'id' | 'name'>, newStatus: ElevatorStatus, description: string): Promise<void> {
    if (newStatus !== ElevatorStatus.MAINTENANCE && newStatus !== ElevatorStatus.ERROR) {
      return;
    }

    // Tạo một đối tượng tham chiếu đến Elevator chỉ với ID
    const elevatorReference = { id: elevator.id } as Elevator;

    const logEntry = this.maintenanceRepository.create({
      elevator: elevatorReference, // TypeORM đủ thông minh để tạo quan hệ chỉ với ID
      description: description,
      status: MaintenanceStatus.PENDING,
      notes: 'Log được tạo tự động do thay đổi trạng thái.',
      reportedBy: 'System',
    });

    await this.maintenanceRepository.save(logEntry);
    this.logger.log(`Created new maintenance log for elevator ${elevator.name} due to status change to ${newStatus}.`);
  }

  async findAll(): Promise<MaintenanceLog[]> {
    return this.maintenanceRepository.find({ 
        relations: ['elevator'], 
        order: { createdAt: 'DESC' } 
    });
  }

  async findOne(id: string): Promise<MaintenanceLog> {
    const maintenanceLog = await this.maintenanceRepository.findOne({ 
      where: { id },
      relations: ['elevator'],
    });
    if (!maintenanceLog) {
      throw new NotFoundException(`Maintenance log with ID "${id}" not found`);
    }
    return maintenanceLog;
  }

  async update(id: string, updateMaintenanceDto: UpdateMaintenanceDto): Promise<MaintenanceLog> {
    // =========================================================
    // === BƯỚC DEBUG: THÊM LOG CHI TIẾT VÀO ĐÂY ===
    // =========================================================
    this.logger.debug(`--- Starting update for maintenance log ID: ${id} ---`);
    this.logger.debug(`Received DTO: ${JSON.stringify(updateMaintenanceDto)}`);
    this.logger.debug(`Type of DTO status: ${typeof updateMaintenanceDto.status}`);
    this.logger.debug(`Value of MaintenanceStatus.COMPLETED: ${MaintenanceStatus.COMPLETED}`);
    this.logger.debug(`Type of MaintenanceStatus.COMPLETED: ${typeof MaintenanceStatus.COMPLETED}`);
    const isStatusCompleted = updateMaintenanceDto.status === MaintenanceStatus.COMPLETED;
    this.logger.debug(`Comparison "updateMaintenanceDto.status === MaintenanceStatus.COMPLETED" is: ${isStatusCompleted}`);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const maintenanceLog = await queryRunner.manager.findOne(MaintenanceLog, { 
        where: { id },
        relations: ['elevator'],
      });
      if (!maintenanceLog) {
        throw new NotFoundException(`Maintenance log with ID "${id}" not found`);
      }

      queryRunner.manager.merge(MaintenanceLog, maintenanceLog, updateMaintenanceDto);
      const updatedLog = await queryRunner.manager.save(maintenanceLog);

      // Bây giờ chúng ta dựa vào kết quả so sánh đã log ở trên
      if (isStatusCompleted && updatedLog.elevator) {
        const { id: elevatorId, name: elevatorName } = updatedLog.elevator;
        this.logger.log(`[TRANSACTION] Condition met. Elevator ${elevatorName} maintenance completed. Setting status to IDLE.`);
        
        await this.elevatorService.updateState(elevatorId, { status: ElevatorStatus.IDLE });
        this.logger.log(`[TRANSACTION] Elevator ${elevatorName} status updated.`);
      } else {
        this.logger.warn(`[TRANSACTION] Condition to update elevator status was NOT met.`);
      }

      await queryRunner.commitTransaction();
      return updatedLog;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to update maintenance log: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to update maintenance log.');
    } finally {
      await queryRunner.release();
    }
  }
}