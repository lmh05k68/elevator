// BE/src/modules/elevator/requestGenerator.service.ts

import { Injectable, OnModuleInit, Logger, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RequestService } from '../request/request.service';

@Injectable()
export class RequestGeneratorService implements OnModuleInit {
  private readonly logger = new Logger(RequestGeneratorService.name);
  private readonly maxFloors: number;
  private readonly minFloors: number;
  private isGenerating = false;

  constructor(
    @Inject(forwardRef(() => RequestService))
    private readonly requestService: RequestService,
    private readonly configService: ConfigService,
  ) {
    // SỬA LỖI: Ép kiểu các giá trị từ .env sang number một cách tường minh
    // Sử dụng Number() là cách an toàn và rõ ràng nhất.
    this.maxFloors = Number(this.configService.get<string>('MAX_FLOORS', '50'));
    this.minFloors = Number(this.configService.get<string>('MIN_FLOORS', '-3'));

    // THÊM LOG ĐỂ DEBUG: In ra các giá trị đã được nạp và kiểm tra kiểu
    this.logger.log(`Configuration loaded: MIN_FLOORS = ${this.minFloors} (type: ${typeof this.minFloors}), MAX_FLOORS = ${this.maxFloors} (type: ${typeof this.maxFloors})`);

    // Kiểm tra nếu giá trị không hợp lệ
    if (isNaN(this.minFloors) || isNaN(this.maxFloors)) {
        throw new Error('Invalid MIN_FLOORS or MAX_FLOORS configuration in .env file.');
    }
  }

  onModuleInit() {
    this.startGenerating();
  }

  startGenerating() {
    if (this.isGenerating) return;
    this.isGenerating = true;

    this.logger.log(`Request generation will start in 5 seconds...`);
    setTimeout(() => {
      this.logger.log(`Request generation started.`);
      setInterval(() => this.generateRandomRequestBatch(), 10000); 
    }, 5000);
  }
  
  private generateRandomRequestBatch() {
    const numberOfRequests = Math.floor(Math.random() * 2) + 1;
    this.logger.log(`-- Generating batch of ${numberOfRequests} automatic requests --`);
    for (let i = 0; i < numberOfRequests; i++) {
      const fromFloor = this.getRandomFloor();
      let toFloor = this.getRandomFloor();
      while (toFloor === fromFloor) {
        toFloor = this.getRandomFloor();
      }
      this.requestService.create({ fromFloor, toFloor });
    }
  }

  private getRandomFloor(): number {
    return Math.floor(Math.random() * (this.maxFloors - this.minFloors + 1)) + this.minFloors;
  }
}