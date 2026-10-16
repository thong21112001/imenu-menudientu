import { io, Socket } from 'socket.io-client';
import { ConnectionStatus } from '@imenu/types';
import { storageService } from './storage';

type StatusListener = (status: ConnectionStatus) => void;

class SocketClient {
  private socket: Socket | null = null;
  private isConnecting: boolean = false;
  private connectionStatus: ConnectionStatus = 'DISCONNECTED';
  private statusListeners: Set<StatusListener> = new Set();
  private wasConnectedBefore: boolean = false;

  private currentRestaurantId?: string;
  private currentBranchId?: string;
  private currentTableId?: string;

  private getSocketUrl(): string {
    if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_WS_URL) {
      return process.env.NEXT_PUBLIC_WS_URL;
    }
    if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '');
    }
    return 'http://localhost:3001';
  }

  private setStatus(status: ConnectionStatus) {
    if (this.connectionStatus !== status) {
      this.connectionStatus = status;
      this.statusListeners.forEach((fn) => {
        try {
          fn(status);
        } catch (e) {
          console.error('[SocketClient] Error in status listener:', e);
        }
      });
    }
  }

  public getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  public onConnectionStatusChange(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    // Notify immediately with current status
    listener(this.connectionStatus);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  public connect(restaurantId?: string, branchId?: string, tableId?: string): Socket | null {
    if (typeof window === 'undefined') return null;

    if (restaurantId) this.currentRestaurantId = restaurantId;
    if (branchId !== undefined) this.currentBranchId = branchId || undefined;
    if (tableId) this.currentTableId = tableId;

    if (this.socket && this.socket.connected) {
      if (this.currentRestaurantId) {
        this.joinRestaurant(this.currentRestaurantId, this.currentBranchId);
      }
      if (this.currentTableId) {
        this.joinTable(this.currentTableId, this.currentRestaurantId);
      }
      this.setStatus('CONNECTED');
      return this.socket;
    }

    if (this.isConnecting) return this.socket;

    this.isConnecting = true;
    this.setStatus(this.wasConnectedBefore ? 'RECONNECTING' : 'CONNECTING');

    const token = storageService.getAccessToken();
    const url = this.getSocketUrl();

    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 2000,
      auth: {
        token: token ? `Bearer ${token}` : undefined,
      },
      query: {
        ...(this.currentRestaurantId ? { restaurantId: this.currentRestaurantId } : {}),
        ...(this.currentBranchId ? { branchId: this.currentBranchId } : {}),
        ...(this.currentTableId ? { tableId: this.currentTableId } : {}),
      },
    });

    this.socket.on('connect', () => {
      this.isConnecting = false;
      const isReconnection = this.wasConnectedBefore;
      this.wasConnectedBefore = true;
      this.setStatus('CONNECTED');
      console.log(`[SocketClient] Connected successfully: ${this.socket?.id} (isReconnection: ${isReconnection})`);

      // Re-join active rooms
      if (this.currentRestaurantId) {
        this.joinRestaurant(this.currentRestaurantId, this.currentBranchId);
      }
      if (this.currentTableId) {
        this.joinTable(this.currentTableId, this.currentRestaurantId);
      }

      // If reconnected after network loss, trigger re-sync event
      if (isReconnection) {
        this.emit('SOCKET_RECONNECTED', { timestamp: Date.now() });
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('imenu:socket_reconnected', {
              detail: {
                timestamp: Date.now(),
                restaurantId: this.currentRestaurantId,
                branchId: this.currentBranchId,
                tableId: this.currentTableId,
              },
            }),
          );
        }
      }
    });

    this.socket.on('connect_error', (err) => {
      this.isConnecting = false;
      this.setStatus(this.wasConnectedBefore ? 'RECONNECTING' : 'DISCONNECTED');
      console.warn(`[SocketClient] Connection error:`, err.message);
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnecting = false;
      this.setStatus('DISCONNECTED');
      console.log(`[SocketClient] Disconnected:`, reason);
    });

    return this.socket;
  }

  /**
   * Cập nhật auth token (khi người dùng đăng nhập hoặc làm mới token)
   */
  public refreshAuthToken(newToken?: string) {
    const token = newToken || storageService.getAccessToken();
    if (this.socket) {
      this.socket.auth = {
        token: token ? `Bearer ${token}` : undefined,
      };
      if (this.socket.connected) {
        // Disconnect and reconnect with new token
        this.socket.disconnect().connect();
      }
    }
  }

  public joinRestaurant(restaurantId: string, branchId?: string) {
    this.currentRestaurantId = restaurantId;
    this.currentBranchId = branchId;
    if (this.socket && this.socket.connected) {
      this.socket.emit('join:restaurant', { restaurantId, branchId });
    }
  }

  /**
   * Chuyển đổi chi nhánh làm việc (Sub-phase 10.2 & 10.3)
   */
  public switchBranch(restaurantId: string, branchId?: string | null) {
    const fromBranchId = this.currentBranchId;
    this.currentRestaurantId = restaurantId;
    this.currentBranchId = branchId || undefined;

    if (this.socket && this.socket.connected) {
      this.socket.emit('switch:branch', {
        restaurantId,
        fromBranchId,
        toBranchId: branchId || undefined,
      });
    }
  }

  public joinTable(tableId: string, restaurantId?: string) {
    this.currentTableId = tableId;
    if (restaurantId) this.currentRestaurantId = restaurantId;
    if (this.socket && this.socket.connected) {
      this.socket.emit('join:table', { tableId, restaurantId: this.currentRestaurantId });
    }
  }

  public leaveTable(tableId: string) {
    if (this.currentTableId === tableId) {
      this.currentTableId = undefined;
    }
    if (this.socket && this.socket.connected) {
      this.socket.emit('leave:table', { tableId });
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

  public pingHealth(): Promise<any> {
    return new Promise((resolve) => {
      if (this.socket && this.socket.connected) {
        this.socket.emit('ping:health', (res: any) => resolve(res));
      } else {
        resolve({ status: 'disconnected', connectionStatus: this.connectionStatus });
      }
    });
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
    this.setStatus('DISCONNECTED');
  }
}

export const socketClient = new SocketClient();
