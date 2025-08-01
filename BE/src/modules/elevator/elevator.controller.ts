// BE/src/modules/elevator/elevator.controller.ts

import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Patch, 
  HttpCode, 
  HttpStatus,
  ParseUUIDPipe // Import Pipe để validate UUID
} from '@nestjs/common';
import { ElevatorService } from './elevator.service';
import { CreateElevatorDto } from '../../dtos/create-elevator.dto';
import { UpdateElevatorStatusDto } from '../../dtos/update-elevator-status.dto';
import { Elevator } from '../../entities/elevator.entity';

@Controller('elevators')
export class ElevatorController {
  constructor(private readonly elevatorService: ElevatorService) {}

  /**
   * POST /elevators
   * Tạo một thang máy mới.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED) // Trả về status 201 Created
  create(@Body() createElevatorDto: CreateElevatorDto): Promise<Elevator> {
    return this.elevatorService.create(createElevatorDto);
  }

  /**
   * GET /elevators
   * Lấy danh sách tất cả các thang máy từ database.
   */
  @Get()
  findAll(): Promise<Elevator[]> {
    return this.elevatorService.findAll();
  }
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<Elevator> {
    return this.elevatorService.findOne(id);
  }
  @Patch(':id/status')
  @HttpCode(HttpStatus.OK) 
  async updateStatus(
    @Param('id', new ParseUUIDPipe()) id: string, 
    @Body() updateElevatorStatusDto: UpdateElevatorStatusDto,
  ): Promise<{ message: string }> {
    this.elevatorService.updateState(id, { status: updateElevatorStatusDto.status });
    
    return { message: 'Elevator status updated successfully' };
  }
}