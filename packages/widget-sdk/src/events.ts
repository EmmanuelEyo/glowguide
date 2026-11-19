import type { SDKEventMap } from './types';

type EventHandler<T> = (data: T) => void;

export class EventEmitter {
  private listeners = new Map<keyof SDKEventMap, Set<EventHandler<unknown>>>();

  on<K extends keyof SDKEventMap>(event: K, handler: EventHandler<SDKEventMap[K]>): () => void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(handler as EventHandler<unknown>);

    return () => this.off(event, handler);
  }

  off<K extends keyof SDKEventMap>(event: K, handler: EventHandler<SDKEventMap[K]>): void {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(handler as EventHandler<unknown>);
      if (set.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  once<K extends keyof SDKEventMap>(event: K, handler: EventHandler<SDKEventMap[K]>): () => void {
    const wrapper: EventHandler<SDKEventMap[K]> = (data) => {
      this.off(event, wrapper);
      handler(data);
    };

    return this.on(event, wrapper);
  }

  emit<K extends keyof SDKEventMap>(event: K, data: SDKEventMap[K]): void {
    const set = this.listeners.get(event);
    if (!set || set.size === 0) return;

    // Snapshot listeners to avoid mutation during iteration
    const handlers = Array.from(set);
    for (const fn of handlers) {
      try {
        fn(data);
      } catch (err) {
        console.error(`GlowGuide SDK: Error in listener for event "${String(event)}":`, err);
      }
    }
  }

  clear(): void {
    this.listeners.clear();
  }
}
