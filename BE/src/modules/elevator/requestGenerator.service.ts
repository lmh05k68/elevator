// BE/src/modules/elevator/requestGenerator.service.ts

import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AlgorithmService } from './algorithm.service';

@Injectable()
export class RequestGeneratorService implements OnModuleInit {
  private readonly logger = new Logger(RequestGeneratorService.name);
  private readonly maxFloors: number;
  private readonly minFloors: number;
  private isGenerating = false;

  constructor(
    private readonly algorithmService: AlgorithmService,
    private readonly configService: ConfigService,
  ) {
    // Lấy giá trị từ .env
    const max = this.configService.get<number>('MAX_FLOORS');
    const min = this.configService.get<number>('MIN_FLOORS');

    // Ép kiểu và cung cấp giá trị mặc định an toàn
    this.maxFloors = max ? Number(max) : 50;
    this.minFloors = min ? Number(min) : -3;

    // THÊM LOG ĐỂ DEBUG: In ra các giá trị đã được nạp
    this.logger.log(`Configuration loaded: MIN_FLOORS = ${this.minFloors}, MAX_FLOORS = ${this.maxFloors}`);
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
      setInterval(() => this.generateRandomRequestBatch(), 5000);
    }, 5000);
  }
  
  private generateRandomRequestBatch() {
    const numberOfRequests = Math.floor(Math.random() * 3) + 1;
    this.logger.log(`-- Generating batch of ${numberOfRequests} requests --`);
    for (let i = 0; i < numberOfRequests; i++) {
      const fromFloor = this.getRandomFloor();
      let toFloor = this.getRandomFloor();
      while (toFloor === fromFloor) {
        toFloor = this.getRandomFloor();
      }
      this.algorithmService.addRequest({ fromFloor, toFloor });
    }
  }

  private getRandomFloor(): number {
    const floor = Math.floor(Math.random() * (this.maxFloors - this.minFloors + 1)) + this.minFloors;
    return floor;
  }
}