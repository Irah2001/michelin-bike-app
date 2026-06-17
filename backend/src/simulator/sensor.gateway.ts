import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class SensorGateway {
  @WebSocketServer()
  server: Server;

  emitSensorReading(data: unknown): void {
    this.server.emit('sensor_reading', data);
  }

  emitRideReading(data: unknown): void {
    this.server.emit('ride_reading', data);
  }
}
