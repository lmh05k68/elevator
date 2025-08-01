// BE/src/modules/request/request.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from '../../entities/request.entity';
import { CreateRequestDto } from '../../dtos/create-request.dto';
import { AlgorithmService } from '../elevator/algorithm.service';

@Injectable()
export class RequestService {
  private readonly logger = new Logger(RequestService.name);

  constructor(
    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>,
    private readonly algorithmService: AlgorithmService,
  ) {}

  async create(createRequestDto: CreateRequestDto): Promise<Request> {
    const { fromFloor, toFloor } = createRequestDto;
    
    // Thêm vào hàng đợi của thuật toán
    this.algorithmService.addRequest({ fromFloor, toFloor });
    
    this.logger.log(`Request from floor ${fromFloor} to ${toFloor} added to algorithm queue.`);

    // Lưu lại vào DB để theo dõi
    const newRequest = this.requestRepository.create({ fromFloor, toFloor });
    return this.requestRepository.save(newRequest);
  }

  async findAll(): Promise<Request[]> {
    return this.requestRepository.find({ order: { createdAt: 'DESC' } });
  }
}