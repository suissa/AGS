import { LLMPluginLayer } from '../src/llm/llm-plugin-layer.js';
import { MockLLMProvider } from '../src/llm/providers/mock-provider.js';
import { EventBus } from '../src/events/event-bus.js';
import { EventLogWriter } from '../src/events/event-log-writer.js';

describe('LLMPluginLayer', () => {
  it('uses mock provider by default', async () => {
    const layer = new LLMPluginLayer('mock');
    const response = await layer.complete({ userMessage: 'Hello' });
    expect(response.provider).toBe('mock');
    expect(response.text).toBeTruthy();
  });

  it('emits llm.used event', async () => {
    const bus = new EventBus('/dev/null');
    (bus as unknown as { logWriter: EventLogWriter }).logWriter.disable();

    const events: string[] = [];
    bus.subscribe('llm.used', () => events.push('fired'));

    const layer = new LLMPluginLayer('mock', bus);
    await layer.complete({ userMessage: 'test' });

    expect(events).toHaveLength(1);
  });

  it('generates task breakdown', async () => {
    const mock = new MockLLMProvider();
    mock.setResponse('Break down', JSON.stringify({
      taskId: 't1',
      title: 'Test task',
      subtasks: [{ id: 's1', description: 'do something', type: 'implementation' }],
      estimatedComplexity: 'low',
    }));

    const layer = new LLMPluginLayer('mock');
    layer.setProvider(mock);

    const breakdown = await layer.generateTaskBreakdown('Build a feature');
    expect(breakdown.taskId).toBe('t1');
    expect(breakdown.subtasks).toHaveLength(1);
  });

  it('validates TASKS.md', async () => {
    const layer = new LLMPluginLayer('mock');
    const result = await layer.validateTasksMD('- [ ] 🚀 #1 - Task');
    expect(result).toHaveProperty('valid');
    expect(result).toHaveProperty('issues');
  });

  it('reviews code', async () => {
    const layer = new LLMPluginLayer('mock');
    const review = await layer.reviewCode('const x = 1;');
    expect(typeof review).toBe('string');
  });
});
