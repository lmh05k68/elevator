// BE/src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const logger = new Logger('Bootstrap'); // Tạo một logger riêng cho quá trình khởi động
  const app = await NestFactory.create(AppModule);

  // Lấy ConfigService từ app instance
  const configService = app.get(ConfigService);

  // Thiết lập global pipes cho validation và transformation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,            // Tự động loại bỏ các thuộc tính không có trong DTO
    forbidNonWhitelisted: true, // Báo lỗi nếu client gửi thuộc tính thừa
    transform: true,            // Kích hoạt tự động chuyển đổi kiểu dữ liệu DTO
    transformOptions: {
      enableImplicitConversion: true, // Cho phép chuyển đổi ngầm định
    },
  }));

  // Cấu hình CORS
  const frontendUrl = configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
  app.enableCors({
    origin: frontendUrl, 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  logger.log(`CORS enabled for origin: ${frontendUrl}`);

  // Lấy PORT và khởi động server
  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  
  logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();