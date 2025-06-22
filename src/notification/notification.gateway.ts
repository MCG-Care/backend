import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationGateway {
  @WebSocketServer()
  server: Server;

  public sendNewBookingNotification(payload: any) {
    console.log('📣 Sending notification:', payload);

    this.server.emit('new-booking', payload);
  }
}
