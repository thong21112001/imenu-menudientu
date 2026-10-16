import { RealtimeEventType, RealtimePayload, ConnectionStatus } from '@imenu/types';
import { socketClient } from './socket-client';

type EventHandler = (payload: RealtimePayload) => void;

const CANONICAL_EVENT_MAP: Record<string, string> = {
  'order:created': 'NEW_ORDER',
  'NEW_ORDER': 'NEW_ORDER',
  'order:item_status_updated': 'ORDER_STATUS_UPDATED',
  'order:updated': 'ORDER_STATUS_UPDATED',
  'ORDER_STATUS_UPDATED': 'ORDER_STATUS_UPDATED',
  'order:round_added': 'ROUND_ADDED',
  'ROUND_ADDED': 'ROUND_ADDED',
  'order:round_confirmed': 'ROUND_CONFIRMED',
  'ROUND_CONFIRMED': 'ROUND_CONFIRMED',
  'order:round_cancelled': 'ROUND_CANCELLED',
  'ROUND_CANCELLED': 'ROUND_CANCELLED',
  'order:confirmed': 'ORDER_CONFIRMED',
  'ORDER_CONFIRMED': 'ORDER_CONFIRMED',
  'order:cancelled': 'ORDER_CANCELLED',
  'ORDER_CANCELLED': 'ORDER_CANCELLED',
  'order:item_cancelled': 'ITEM_CANCELLED',
  'ITEM_CANCELLED': 'ITEM_CANCELLED',
  'order:payment_requested': 'PAYMENT_REQUESTED',
  'PAYMENT_REQUESTED': 'PAYMENT_REQUESTED',
  'order:payment_completed': 'PAYMENT_COMPLETED',
  'PAYMENT_COMPLETED': 'PAYMENT_COMPLETED',
  'table:status_updated': 'TABLE_STATUS_UPDATED',
  'TABLE_STATUS_UPDATED': 'TABLE_STATUS_UPDATED',
  'table:call_staff': 'CALL_STAFF',
  'CALL_STAFF': 'CALL_STAFF',
  'table:call_acknowledged': 'CALL_STAFF_ACKNOWLEDGED',
  'CALL_STAFF_ACKNOWLEDGED': 'CALL_STAFF_ACKNOWLEDGED',
  'table:qr_updated': 'TABLE_QR_UPDATED',
  'TABLE_QR_UPDATED': 'TABLE_QR_UPDATED',
  'menu:availability_changed': 'MENU_AVAILABILITY_CHANGED',
  'MENU_AVAILABILITY_CHANGED': 'MENU_AVAILABILITY_CHANGED',
  'SOCKET_RECONNECTED': 'SOCKET_RECONNECTED',
};

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

        // AUD-10.5: Dispatch qua bộ phân phối an toàn (khử trùng lặp và tránh echo wildcard)
        this.dispatchSocketEvent(normalizedPayload, wsEvent);
      });
    });
  }

  /**
   * Kiểm tra và loại bỏ sự kiện trùng lặp (Deduplication Window 300ms theo Canonical Event Key)
   */
  private isDuplicate(payload: RealtimePayload): boolean {
    const canonicalType = CANONICAL_EVENT_MAP[payload.type] || payload.type;
    const dataId =
      payload.data?.notificationId ||
      payload.data?.id ||
      payload.data?._id ||
      payload.data?.tableId ||
      payload.data?.orderId ||
      payload.timestamp ||
      '';
    const key = `${canonicalType}_${dataId}`;
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

  /**
   * Phân phối sự kiện nhận từ Socket.IO với cơ chế chống âm báo kép (AUD-10.5 Hardened)
   */
  private dispatchSocketEvent(normalizedPayload: RealtimePayload, wsEvent: string) {
    if (!normalizedPayload || !normalizedPayload.type) return;

    if (this.isDuplicate(normalizedPayload)) {
      return;
    }

    // 1. Dispatch tới các handler đăng ký theo localType (ví dụ 'CALL_STAFF' hoặc 'NEW_ORDER')
    const localHandlers = this.listeners.get(normalizedPayload.type);
    if (localHandlers) {
      localHandlers.forEach((fn) => {
        try {
          fn(normalizedPayload);
        } catch (err) {
          console.error(`[RealtimeHub] Error in handler for ${normalizedPayload.type}:`, err);
        }
      });
    }

    // 2. Dispatch tới các handler đăng ký theo tên event Socket gốc nếu khác localType (ví dụ 'table:call_staff')
    if (wsEvent && wsEvent !== normalizedPayload.type) {
      const wsHandlers = this.listeners.get(wsEvent);
      if (wsHandlers) {
        const wsPayload: RealtimePayload = {
          ...normalizedPayload,
          type: wsEvent,
        };
        wsHandlers.forEach((fn) => {
          try {
            fn(wsPayload);
          } catch (err) {
            console.error(`[RealtimeHub] Error in handler for ${wsEvent}:`, err);
          }
        });
      }
    }

    // 3. Dispatch tới Wildcard Handler '*' DUY NHẤT 1 LẦN (Khử hoàn toàn Double Chime do alias)
    const allHandlers = this.listeners.get('*');
    if (allHandlers) {
      allHandlers.forEach((fn) => {
        try {
          fn(normalizedPayload);
        } catch (err) {
          console.error(`[RealtimeHub] Error executing wildcard handler for ${normalizedPayload.type}:`, err);
        }
      });
    }
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
