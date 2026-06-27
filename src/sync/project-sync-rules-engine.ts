import { AGSEventType } from '../events/event-types.js';
import { SyncRule, RuleExecutionContext, RuleExecutionResult } from './rule-types.js';
import { RuleExecutor } from './rule-executor.js';
import { DEFAULT_RULES_SIMPLE } from './default-rules.simple.js';
import { DEFAULT_RULES_ALLASCODE } from './default-rules.allascode.js';
import { EventBus } from '../events/event-bus.js';

export interface SyncEngineConfig {
  owner: string;
  repo: string;
  mode: 'simple' | 'allascode';
  dryRun: boolean;
  customRules?: SyncRule[];
}

export class ProjectSyncRulesEngine {
  private rules: SyncRule[];
  private executor: RuleExecutor;
  private config: SyncEngineConfig;

  constructor(config: SyncEngineConfig) {
    this.config = config;
    this.executor = new RuleExecutor();
    this.rules = this.buildRules(config);
  }

  private buildRules(config: SyncEngineConfig): SyncRule[] {
    const defaults = config.mode === 'simple' ? DEFAULT_RULES_SIMPLE : DEFAULT_RULES_ALLASCODE;
    return [...defaults, ...(config.customRules ?? [])];
  }

  attachToEventBus(bus: EventBus): void {
    bus.subscribe('*', async (event) => {
      await this.processEvent(event.type, event.payload, event.ctid);
    });
  }

  async processEvent(
    type: AGSEventType,
    payload: Record<string, unknown> = {},
    ctid?: string
  ): Promise<RuleExecutionResult[]> {
    const matchingRules = this.rules.filter(r => r.enabled && r.event === type);

    if (matchingRules.length === 0) return [];

    const ctx: RuleExecutionContext = {
      event: { type, ctid, payload },
      config: this.config,
    };

    const results: RuleExecutionResult[] = [];
    for (const rule of matchingRules) {
      const result = await this.executor.execute(rule, ctx);
      results.push(result);
    }

    return results;
  }

  addRule(rule: SyncRule): void {
    this.rules.push(rule);
  }

  removeRule(ruleId: string): void {
    this.rules = this.rules.filter(r => r.id !== ruleId);
  }

  getRules(): SyncRule[] {
    return [...this.rules];
  }

  enableRule(ruleId: string): void {
    const rule = this.rules.find(r => r.id === ruleId);
    if (rule) rule.enabled = true;
  }

  disableRule(ruleId: string): void {
    const rule = this.rules.find(r => r.id === ruleId);
    if (rule) rule.enabled = false;
  }
}
