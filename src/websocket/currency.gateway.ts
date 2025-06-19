import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CurrencyService } from '../currency/currency.service';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/ws-jwt.guard';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
})
export class CurrencyGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedClients = new Map<string, Socket>();

  constructor(private readonly currencyService: CurrencyService) {}

  async handleConnection(client: Socket) {
    this.connectedClients.set(client.id, client);
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
    console.log(`Client disconnected: ${client.id}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('subscribe_rates')
  async handleSubscribeRates(client: Socket, data: { currencies: string[] }) {
    // Subscribe to real-time rate updates for specific currencies
    client.join(`rates_${data.currencies.join('_')}`);
    return { message: 'Subscribed to rate updates' };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('unsubscribe_rates')
  async handleUnsubscribeRates(client: Socket, data: { currencies: string[] }) {
    client.leave(`rates_${data.currencies.join('_')}`);
    return { message: 'Unsubscribed from rate updates' };
  }

  // Method to broadcast rate updates to subscribed clients
  async broadcastRateUpdate(rates: any) {
    this.server.emit('rate_update', rates);
  }

  // Method to send personalized updates to specific user
  async sendUserUpdate(userId: string, data: any) {
    this.server.to(`user_${userId}`).emit('user_update', data);
  }
} 