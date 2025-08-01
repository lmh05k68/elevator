// src/modules/request/request.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { RequestService } from './request.service';
import { CreateRequestDto } from '../../dtos/create-request.dto';

@Controller('requests')
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @Post()
  create(@Body() createRequestDto: CreateRequestDto) {
    return this.requestService.create(createRequestDto);
  }

  @Get()
  findAll() {
    return this.requestService.findAll();
  }
}