import { ProjectSyncRulesEngine } from '../src/sync/project-sync-rules-engine.js';
import { EventBus } from '../src/events/event-bus.js';
import { EventLogWriter } from '../src/events/event-log-writer.js';
import { AGSEventType } from '../src/events/event-types.js';

describe('ProjectSyncRulesEngine', () => {
  const makeEngine = (mode: 'simple' | 'allascode') =>
    new ProjectSyncRulesEngine({
      owner: 'suissa',
      repo: 'ags',
      mode,
      dryRun: true,
    });

  it('loads simple rules', () => {
    const engine = makeEngine('simple');
    const rules = engine.getRules();
    expect(rules.length).toBeGreaterThan(0);
    const eventTypes = rules.map(r => r.event);
    expect(eventTypes).toContain('task.created');
    expect(eventTypes).toContain('pr.merged');
  });

  it('loads allascode rules', () => {
    const engine = makeEngine('allascode');
    const rules = engine.getRules();
    expect(rules.length).toBeGreaterThan(4);
    const eventTypes = rules.map(r => r.event);
    expect(eventTypes).toContain('dependabot.alert');
    expect(eventTypes).toContain('llm.used');
  });

  it('executes rules for task.created', async () => {
    const engine = makeEngine('simple');
    const results = await engine.processEvent('task.created', { issueNumber: 1 });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].success).toBe(true);
  });

  it('returns no results for unknown event', async () => {
    const engine = makeEngine('simple');
    const results = await engine.processEvent('unknown.event', {});
    expect(results).toHaveLength(0);
  });

  it('attaches to event bus and auto-processes events', async () => {
    const engine = makeEngine('simple');
    const bus = new EventBus('/dev/null');
    (bus as unknown as { logWriter: EventLogWriter }).logWriter.disable();

    const processedEvents: AGSEventType[] = [];
    engine.attachToEventBus(bus);

    bus.subscribe('*', (ev) => {
      processedEvents.push(ev.type);
    });

    bus.publish('task.created', { issueNumber: 2 });
    await new Promise(r => setTimeout(r, 50));

    expect(processedEvents).toContain('task.created');
  });

  it('enables and disables rules', () => {
    const engine = makeEngine('simple');
    const rules = engine.getRules();
    const firstRuleId = rules[0].id;

    engine.disableRule(firstRuleId);
    expect(engine.getRules().find(r => r.id === firstRuleId)!.enabled).toBe(false);

    engine.enableRule(firstRuleId);
    expect(engine.getRules().find(r => r.id === firstRuleId)!.enabled).toBe(true);
  });
});
