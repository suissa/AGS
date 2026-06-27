import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { AGSEvent, AGSEventType } from './event-types.js';
import { EventStore } from './event-store.js';
import { EventLogWriter } from './event-log-writer.js';

export class EventBus extends EventEmitter {
  private store: EventStore;
  private logWriter: EventLogWriter;

  constructor(logPath?: string) {
    super();
    this.setMaxListeners(50);
    this.store = new EventStore();
    this.logWriter = new EventLogWriter(logPath);
  }

  publish(
    type: AGSEventType,
    payload: Record<string, unknown>,
    options?: { ctid?: string; source?: string }
  ): AGSEvent {
    const event: AGSEvent = {
      id: uuidv4(),
      type,
      ctid: options?.ctid,
      source: options?.source ?? 'ags',
      payload,
      createdAt: new Date().toISOString(),
    };

    this.store.add(event);
    this.logWriter.write(event);
    this.emit(type, event);
    this.emit('*', event);

    return event;
  }

  subscribe(type: AGSEventType | '*', handler: (event: AGSEvent) => void): void {
    this.on(type, handler);
  }

  unsubscribe(type: AGSEventType | '*', handler: (event: AGSEvent) => void): void {
    this.off(type, handler);
  }

  getHistory(type?: AGSEventType): AGSEvent[] {
    return type ? this.store.getByType(type) : this.store.getAll();
  }
}
