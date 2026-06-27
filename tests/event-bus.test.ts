import { EventBus } from '../src/events/event-bus.js';
import { EventLogWriter } from '../src/events/event-log-writer.js';

describe('EventBus', () => {
  let bus: EventBus;

  beforeEach(() => {
    bus = new EventBus('/dev/null');
    (bus as unknown as { logWriter: EventLogWriter }).logWriter.disable();
  });

  it('publishes an event with id, type, createdAt', () => {
    const event = bus.publish('task.created', { issueNumber: 1 });
    expect(event.id).toBeTruthy();
    expect(event.type).toBe('task.created');
    expect(event.createdAt).toBeTruthy();
    expect(event.payload).toEqual({ issueNumber: 1 });
  });

  it('delivers event to subscriber', (done) => {
    bus.subscribe('task.created', (ev) => {
      expect(ev.type).toBe('task.created');
      done();
    });
    bus.publish('task.created', {});
  });

  it('delivers event to wildcard subscriber', (done) => {
    bus.subscribe('*', (ev) => {
      expect(ev.type).toBeDefined();
      done();
    });
    bus.publish('ci.success', { stage: 'test' });
  });

  it('attaches ctid to event', () => {
    const event = bus.publish('task.created', {}, { ctid: 'ctid_test_1_abc12345', source: 'test' });
    expect(event.ctid).toBe('ctid_test_1_abc12345');
    expect(event.source).toBe('test');
  });

  it('stores events in history', () => {
    bus.publish('task.created', { n: 1 });
    bus.publish('ci.failed', { stage: 'test' });
    const all = bus.getHistory();
    expect(all.length).toBe(2);
    const ci = bus.getHistory('ci.failed');
    expect(ci.length).toBe(1);
  });

  it('unsubscribes handler', () => {
    let callCount = 0;
    const handler = () => { callCount++; };
    bus.subscribe('pr.opened', handler);
    bus.unsubscribe('pr.opened', handler);
    bus.publish('pr.opened', {});
    expect(callCount).toBe(0);
  });
});
