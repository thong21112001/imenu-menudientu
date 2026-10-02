import { RealtimeEventType, RealtimePayload } from '@imenu/types';
import { socketClient } from './socket-client';

type EventHandler = (payload: RealtimePayload) => void;

class RealtimeHub {
  private channel: BroadcastChannel | null = null;
  private listeners: Map<string, Set<EventHandler>> = new Map();
  private socketInitialized: boolean = false;

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
      { wsEvent: 'table:status_updated', localType: 'TABLE_STATUS_UPDATED' },
      { wsEvent: 'order:payment_completed', localType: 'PAYMENT_COMPLETED' },
    ];

    eventMapping.forEach(({ wsEvent, localType }) => {
      socketClient.on(wsEvent, (payload: any) => {
        const normalizedPayload: RealtimePayload = {
          type: localType,
          restaurantId: payload?.restaurantId || 'rest-bep-nha',
          branchId: payload?.branchId,
          timestamp: Date.now(),
          data: payload?.order || payload?.table || payload?.data || payload,
        };
        this.handleIncoming(normalizedPayload);

        // Cũng dispatch theo tên event gốc
        this.handleIncoming({
          ...normalizedPayload,
          type: wsEvent,
        });
      });
    });
  }

  private handleIncoming(payload: RealtimePayload) {
    if (!payload || !payload.type) return;
    const handlers = this.listeners.get(payload.type);
    if (handlers) {
      handlers.forEach((fn) => fn(payload));
    }
    const allHandlers = this.listeners.get('*');
    if (allHandlers) {
      allHandlers.forEach((fn) => fn(payload));
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
      this.channel.postMessage(payload);
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
}

export const realtimeHub = new RealtimeHub();
