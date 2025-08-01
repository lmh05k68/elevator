// BE/src/modules/maintenance/maintenance.controller.ts
import { Controller, Get, Post, Body, Param, Patch, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceLogDto } from '../../dtos/create-maintenance-log.dto'; // Sửa tên import
import { UpdateMaintenanceDto } from '../../dtos/update-maintenance.dto';
import { MaintenanceLog } from '../../entities/maintenance.entity';

@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createMaintenanceDto: CreateMaintenanceLogDto): Promise<MaintenanceLog> {
    return this.maintenanceService.create(createMaintenanceDto);
  }

  @Get()
  findAll(): Promise<MaintenanceLog[]> {
    return this.maintenanceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<MaintenanceLog> {
    return this.maintenanceService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string, 
    @Body() updateMaintenanceDto: UpdateMaintenanceDto
  ): Promise<MaintenanceLog> {
    return this.maintenanceService.update(id, updateMaintenanceDto);
  }
}