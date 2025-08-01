import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request, RequestStatus } from '../../entities/request.entity';
import { CreateRequestDto } from '../../dtos/create-request.dto';
import { AlgorithmService } from '../elevator/algorithm.service';

@Injectable()
export class RequestService {
  constructor(
    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>,
    private readonly algorithmService: AlgorithmService,
  ) {}
  async create(createRequestDto: CreateRequestDto): Promise<Request> {
    const { fromFloor, toFloor } = createRequestDto;
    const newRequest = this.requestRepository.create({
      fromFloor,
      toFloor,
      status: RequestStatus.PENDING, 
    });
    const savedRequest = await this.requestRepository.save(newRequest);
    this.algorithmService.addRequest({ fromFloor, toFloor });
    
    console.log(`Manual request from floor ${fromFloor} to ${toFloor} added to queue.`);

    return savedRequest;
  }
  async findAll(): Promise<Request[]> {
    return this.requestRepository.find({ order: { createdAt: 'DESC' } });
  }
}