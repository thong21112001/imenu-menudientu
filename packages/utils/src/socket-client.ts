import { io, Socket } from 'socket.io-client';
import { storageService } from './storage';

class SocketClient {
  private socket: Socket | null = null;
  private isConnecting: boolean = false;
  private currentRestaurantId?: string;
  private currentBranchId?: string;

  private getSocketUrl(): string {
    if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_WS_URL) {
      return process.env.NEXT_PUBLIC_WS_URL;
    }
    if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '');
    }
    return 'http://localhost:3001';
  }

  public connect(restaurantId?: string, branchId?: string): Socket | null {
    if (typeof window === 'undefined') return null;

    this.currentRestaurantId = restaurantId || this.currentRestaurantId;
    this.currentBranchId = branchId || this.currentBranchId;

    if (this.socket && this.socket.connected) {
      if (this.currentRestaurantId) {
        this.joinRestaurant(this.currentRestaurantId, this.currentBranchId);
      }
      return this.socket;
    }

    if (this.isConnecting) return this.socket;

    this.isConnecting = true;
    const token = storageService.getAccessToken();
    const url = this.getSocketUrl();

    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      auth: {
        token: token ? `Bearer ${token}` : undefined,
      },
    });

    this.socket.on('connect', () => {
      this.isConnecting = false;
      console.log(`[SocketClient] Connected successfully: ${this.socket?.id}`);
      if (this.currentRestaurantId) {
        this.joinRestaurant(this.currentRestaurantId, this.currentBranchId);
      }
    });

    this.socket.on('connect_error', (err) => {
      this.isConnecting = false;
      console.warn(`[SocketClient] Connection error:`, err.message);
    });

    this.socket.on('disconnect', (reason) => {
      console.log(`[SocketClient] Disconnected:`, reason);
    });

    return this.socket;
  }

  public joinRestaurant(restaurantId: string, branchId?: string) {
    this.currentRestaurantId = restaurantId;
    this.currentBranchId = branchId;
    if (this.socket && this.socket.connected) {
      this.socket.emit('join:restaurant', { restaurantId, branchId });
    }
  }

  public joinTable(tableId: string, restaurantId?: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('join:table', { tableId, restaurantId });
    }
  }

  public on(event: string, handler: (data: any) => void) {
    if (!this.socket) {
      this.connect();
    }
    this.socket?.on(event, handler);
    return () => {
      this.socket?.off(event, handler);
    };
  }

  public off(event: string, handler?: (data: any) => void) {
    if (handler) {
      this.socket?.off(event, handler);
    } else {
      this.socket?.off(event);
    }
  }

  public emit(event: string, data: any) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
  }
}

export const socketClient = new SocketClient();
