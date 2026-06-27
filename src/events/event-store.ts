import { AGSEvent, AGSEventType } from './event-types.js';

export class EventStore {
  private events: AGSEvent[] = [];

  add(event: AGSEvent): void {
    this.events.push(event);
  }

  getAll(): AGSEvent[] {
    return [...this.events];
  }

  getByType(type: AGSEventType): AGSEvent[] {
    return this.events.filter(e => e.type === type);
  }

  getByCTID(ctid: string): AGSEvent[] {
    return this.events.filter(e => e.ctid === ctid);
  }

  clear(): void {
    this.events = [];
  }

  get size(): number {
    return this.events.length;
  }
}
