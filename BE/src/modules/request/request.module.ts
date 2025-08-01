// BE/src/modules/request/request.module.ts

import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestService } from './request.service';
import { RequestController } from './request.controller';
import { Request } from '../../entities/request.entity';
import { ElevatorModule } from '../elevator/elevator.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Request]),
    forwardRef(() => ElevatorModule), // <-- DÙNG forwardRef
  ],
  controllers: [RequestController],
  providers: [RequestService],
  exports: [RequestService], // <-- EXPORT SERVICE ĐỂ GENERATOR DÙNG
})
export class RequestModule {}