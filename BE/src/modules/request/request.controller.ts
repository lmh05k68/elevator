// BE/src/modules/request/request.controller.ts
import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { RequestService } from './request.service';
import { CreateRequestDto } from '../../dtos/create-request.dto';
import { Request } from '../../entities/request.entity';

@Controller('requests')
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  create(@Body() createRequestDto: CreateRequestDto): Promise<Request> {
    return this.requestService.create(createRequestDto);
  }

  @Get()
  findAll(): Promise<Request[]> {
    return this.requestService.findAll();
  }
}