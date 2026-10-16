import { RealtimeEventType, RealtimePayload, ConnectionStatus } from '@imenu/types';
import { socketClient } from './socket-client';

type EventHandler = (payload: RealtimePayload) => void;

class RealtimeHub {
  private channel: BroadcastChannel | null = null;
  private listeners: Map<string, Set<EventHandler>> = new Map();
  private socketInitialized: boolean = false;
  // Deduplication cache: key -> timestamp
  private recentEvents: Map<string, number> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      // 1. Khởi tạo BroadcastChannel cho nội bộ các tab cùng browser
      if ('BroadcastChannel' in window) {
        try {
          this.channel = new BroadcastChannel('imenu_realtime_channel');
          this.channel.onmessage = (event) => {
            this.handleIncoming(event.data);
          };
        } catch (e) {
          console.warn('BroadcastChannel not supported or restricted', e);
        }
      }

      // 2. Kết nối Socket.IO Client tới Backend API
      this.initSocketListeners();
    }
  }

  private initSocketListeners() {
    if (this.socketInitialized || typeof window === 'undefined') return;
    this.socketInitialized = true;

    socketClient.connect();

    // Lắng nghe các event từ WebSocket server
    const eventMapping: Array<{ wsEvent: string; localType: RealtimeEventType }> = [
      { wsEvent: 'order:created', localType: 'NEW_ORDER' },
      { wsEvent: 'order:item_status_updated', localType: 'ORDER_STATUS_UPDATED' },
      { wsEvent: 'order:round_added', localType: 'ROUND_ADDED' },
      { wsEvent: 'order:round_confirmed', localType: 'ROUND_CONFIRMED' },
      { wsEvent: 'order:round_cancelled', localType: 'ROUND_CANCELLED' },
      { wsEvent: 'order:confirmed', localType: 'ORDER_CONFIRMED' },
      { wsEvent: 'order:cancelled', localType: 'ORDER_CANCELLED' },
      { wsEvent: 'order:item_cancelled', localType: 'ITEM_CANCELLED' },
      { wsEvent: 'order:payment_requested', localType: 'PAYMENT_REQUESTED' },
      { wsEvent: 'order:payment_completed', localType: 'PAYMENT_COMPLETED' },
      { wsEvent: 'order:updated', localType: 'ORDER_STATUS_UPDATED' },
      { wsEvent: 'table:status_updated', localType: 'TABLE_STATUS_UPDATED' },
      { wsEvent: 'table:call_staff', localType: 'CALL_STAFF' },
      { wsEvent: 'CALL_STAFF', localType: 'CALL_STAFF' },
      { wsEvent: 'table:call_acknowledged', localType: 'CALL_STAFF_ACKNOWLEDGED' },
      { wsEvent: 'table:qr_updated', localType: 'TABLE_QR_UPDATED' },
      { wsEvent: 'menu:availability_changed', localType: 'MENU_AVAILABILITY_CHANGED' },
      { wsEvent: 'SOCKET_RECONNECTED', localType: 'SOCKET_RECONNECTED' },
    ];

    eventMapping.forEach(({ wsEvent, localType }) => {
      socketClient.on(wsEvent, (payload: any) => {
        const normalizedPayload: RealtimePayload = {
          type: localType,
          restaurantId: payload?.restaurantId || 'rest-bep-nha',
          branchId: payload?.branchId,
          timestamp: payload?.timestamp || Date.now(),
          data: payload?.order || payload?.table || payload?.item || payload?.data || payload,
        };
        this.handleIncoming(normalizedPayload);

        // Cũng dispatch theo tên event gốc nếu khác localType
        if (wsEvent !== localType) {
          this.handleIncoming({
            ...normalizedPayload,
            type: wsEvent,
          });
        }
      });
    });
  }

  /**
   * Kiểm tra và loại bỏ sự kiện trùng lặp (Deduplication Window 300ms)
   */
  private isDuplicate(payload: RealtimePayload): boolean {
    const dataId =
      payload.data?.notificationId ||
      payload.data?.id ||
      payload.data?._id ||
      payload.data?.tableId ||
      payload.data?.orderId ||
      '';
    const key = `${payload.type}_${dataId}`;
    const now = Date.now();
    const lastTime = this.recentEvents.get(key);

    if (lastTime && now - lastTime < 300) {
      return true;
    }

    this.recentEvents.set(key, now);

    // Dọn dẹp cache sau mỗi 100 sự kiện
    if (this.recentEvents.size > 200) {
      for (const [k, t] of this.recentEvents.entries()) {
        if (now - t > 5000) {
          this.recentEvents.delete(k);
        }
      }
    }

    return false;
  }

  private handleIncoming(payload: RealtimePayload) {
    if (!payload || !payload.type) return;

    if (this.isDuplicate(payload)) {
      return;
    }

    const handlers = this.listeners.get(payload.type);
    if (handlers) {
      handlers.forEach((fn) => {
        try {
          fn(payload);
        } catch (err) {
          console.error(`[RealtimeHub] Error executing handler for ${payload.type}:`, err);
        }
      });
    }

    const allHandlers = this.listeners.get('*');
    if (allHandlers) {
      allHandlers.forEach((fn) => {
        try {
          fn(payload);
        } catch (err) {
          console.error(`[RealtimeHub] Error executing wildcard handler for ${payload.type}:`, err);
        }
      });
    }
  }

  public publish(type: RealtimeEventType, data: any, restaurantId: string = 'rest-bep-nha', branchId?: string) {
    const payload: RealtimePayload = {
      type,
      restaurantId,
      branchId,
      timestamp: Date.now(),
      data,
    };

    // Dispatch locally in current window
    this.handleIncoming(payload);

    // Broadcast to other tabs
    if (this.channel) {
      try {
        this.channel.postMessage(payload);
      } catch (e) {
        console.warn('[RealtimeHub] BroadcastChannel postMessage error:', e);
      }
    }

    // Emit qua Socket.IO nếu cần
    socketClient.emit(type, payload);
  }

  public subscribe(type: RealtimeEventType | '*', handler: EventHandler): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(handler);

    return () => {
      const set = this.listeners.get(type);
      if (set) {
        set.delete(handler);
      }
    };
  }

  public joinRestaurant(restaurantId: string, branchId?: string) {
    socketClient.joinRestaurant(restaurantId, branchId);
  }

  public switchBranch(restaurantId: string, branchId?: string | null) {
    socketClient.switchBranch(restaurantId, branchId);
  }

  public joinTable(tableId: string, restaurantId?: string) {
    socketClient.joinTable(tableId, restaurantId);
  }

  public leaveTable(tableId: string) {
    socketClient.leaveTable(tableId);
  }

  public getConnectionStatus(): ConnectionStatus {
    return socketClient.getConnectionStatus();
  }

  public onConnectionStatusChange(listener: (status: ConnectionStatus) => void): () => void {
    return socketClient.onConnectionStatusChange(listener);
  }
}

export const realtimeHub = new RealtimeHub();
