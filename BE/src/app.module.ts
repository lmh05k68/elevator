// BE/src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ElevatorModule } from './modules/elevator/elevator.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { RequestModule } from './modules/request/request.module';
import { EventsModule } from './events/events.module'; // Chỉ cần import module là đủ
import { Elevator } from './entities/elevator.entity';
import { MaintenanceLog } from './entities/maintenance.entity';
import { Request } from './entities/request.entity';
import { Floor } from './entities/floor.entity'; 

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USERNAME'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        entities: [Elevator, MaintenanceLog, Request, Floor],
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        logging: configService.get<string>('NODE_ENV') !== 'production',
      }),
    }),
    ElevatorModule,
    MaintenanceModule,
    RequestModule,
    EventsModule, // Import EventsModule ở đây
  ],
  controllers: [AppController],
  // SỬA LỖI: Xóa EventsGateway khỏi đây. Module của nó đã quản lý nó rồi.
  providers: [AppService],
})
export class AppModule {}