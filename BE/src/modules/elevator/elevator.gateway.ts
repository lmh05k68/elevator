import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Elevator } from '../../entities/elevator.entity';

@WebSocketGateway({
  cors: {
    origin: '*', 
  },
})
export class ElevatorGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    console.log('WebSocket Gateway Initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }
  broadcastElevatorUpdate(elevator: Elevator) {
    this.server.emit('elevatorUpdate', elevator); 
  }
  broadcastNewElevator(elevator: Elevator) {
    this.server.emit('newElevator', elevator);
  }
}