// src/events/events.gateway.ts

import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
@WebSocketGateway({
  cors: {
    origin: '*', 
  },
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() 
  server: Server;

  private logger: Logger = new Logger('EventsGateway');
  afterInit(server: Server) {
    this.logger.log('Initialized!');
  }
  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
    client.emit('message', `Chào mừng bạn ${client.id} đã kết nối!`);
  }
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }
  @SubscribeMessage('msgToServer')
  handleMessage(client: Socket, payload: any): void {
    this.logger.log(`Received message from ${client.id}:`, payload);
    this.server.emit('msgToClient', payload);
  }
  sendElevatorUpdate(updateData: any) {
    this.logger.log(`--- GATEWAY: Chuẩn bị gửi sự kiện 'elevator_update' với dữ liệu:`, updateData)
    this.server.emit('elevator_update', updateData);
    this.logger.log(`Sent elevator update: ${JSON.stringify(updateData)}`);
  }
   sendNewElevator(newElevatorData: any) {
    this.logger.log(`--- GATEWAY: Emitting 'new_elevator' with data:`, JSON.stringify(newElevatorData));
    this.server.emit('new_elevator', newElevatorData);
  }
}