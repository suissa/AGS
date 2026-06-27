import { createInitialTUIState, applyEventToState } from '../src/tui/tui-state.js';
import { AGSEvent } from '../src/events/event-types.js';

function makeEvent(type: string, payload: Record<string, unknown> = {}): AGSEvent {
  return {
    id: 'test-id',
    type,
    source: 'test',
    payload,
    createdAt: new Date().toISOString(),
  };
}

describe('TUI State', () => {
  it('creates initial state', () => {
    const state = createInitialTUIState('simple', 'owner/repo');
    expect(state.mode).toBe('simple');
    expect(state.repo).toBe('owner/repo');
    expect(state.recentEvents).toHaveLength(0);
    expect(state.agents).toHaveLength(0);
  });

  it('appends event to recentEvents', () => {
    const state = createInitialTUIState('simple', 'test/repo');
    const event = makeEvent('task.created', { issueNumber: 1 });
    const next = applyEventToState(state, event);
    expect(next.recentEvents).toHaveLength(1);
    expect(next.recentEvents[0].type).toBe('task.created');
  });

  it('keeps only 10 most recent events', () => {
    let state = createInitialTUIState('simple', 'test/repo');
    for (let i = 0; i < 15; i++) {
      state = applyEventToState(state, makeEvent('task.created'));
    }
    expect(state.recentEvents).toHaveLength(10);
  });

  it('tracks agent status', () => {
    let state = createInitialTUIState('simple', 'test/repo');
    state = applyEventToState(state, makeEvent('agent.started', { name: 'builder-a' }));
    expect(state.agents[0]).toEqual({ name: 'builder-a', status: 'running' });

    state = applyEventToState(state, makeEvent('agent.completed', { name: 'builder-a' }));
    expect(state.agents[0].status).toBe('completed');
  });

  it('tracks CI status', () => {
    let state = createInitialTUIState('simple', 'test/repo');
    state = applyEventToState(state, makeEvent('ci.started', { stage: 'test' }));
    expect(state.ciStatus[0]).toEqual({ stage: 'test', status: 'running' });

    state = applyEventToState(state, makeEvent('ci.failed', { stage: 'test' }));
    expect(state.ciStatus[0].status).toBe('failed');
  });
});
