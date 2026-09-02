import { RealtimeEventType, RealtimePayload } from '@imenu/types';

type EventHandler = (payload: RealtimePayload) => void;

class RealtimeHub {
  private channel: BroadcastChannel | null = null;
  private listeners: Map<string, Set<EventHandler>> = new Map();

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('imenu_realtime_channel');
        this.channel.onmessage = (event) => {
          this.handleIncoming(event.data);
        };
      } catch (e) {
        console.warn('BroadcastChannel not supported or restricted', e);
      }
    }
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

  public publish(type: RealtimeEventType, data: any, restaurantId: string = 'rest-bep-nha') {
    const payload: RealtimePayload = {
      type,
      restaurantId,
      timestamp: Date.now(),
      data,
    };

    // Dispatch locally in current window
    this.handleIncoming(payload);

    // Broadcast to other tabs
    if (this.channel) {
      this.channel.postMessage(payload);
    }
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
}

export const realtimeHub = new RealtimeHub();
