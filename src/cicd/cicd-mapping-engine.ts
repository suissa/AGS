import { WorkflowRunSummary, CICDMappingRule } from './cicd-types.js';
import { DEFAULT_CICD_RULES } from './default-cicd-rules.js';
import { EventBus } from '../events/event-bus.js';
import { ProjectSyncRulesEngine } from '../sync/project-sync-rules-engine.js';

export interface MappingResult {
  run: WorkflowRunSummary;
  matchedRule?: CICDMappingRule;
  eventEmitted?: string;
}

export class CICDMappingEngine {
  private rules: CICDMappingRule[];
  private eventBus: EventBus;
  private syncEngine?: ProjectSyncRulesEngine;

  constructor(
    eventBus: EventBus,
    options: { customRules?: CICDMappingRule[]; syncEngine?: ProjectSyncRulesEngine } = {}
  ) {
    this.eventBus = eventBus;
    this.rules = [...DEFAULT_CICD_RULES, ...(options.customRules ?? [])];
    this.syncEngine = options.syncEngine;
  }

  processRun(run: WorkflowRunSummary, ctid?: string): MappingResult {
    if (run.status !== 'completed') {
      return { run };
    }

    const matched = this.findRule(run);
    if (!matched) {
      return { run };
    }

    const payload = {
      stage: run.stage,
      workflowName: run.name,
      conclusion: run.conclusion,
      branch: run.branch,
      url: run.url,
      projectStatus: matched.projectStatus,
    };

    this.eventBus.publish(matched.agsEvent, payload, { ctid });

    if (this.syncEngine) {
      this.syncEngine.processEvent(matched.agsEvent, payload, ctid);
    }

    return { run, matchedRule: matched, eventEmitted: matched.agsEvent };
  }

  processRuns(runs: WorkflowRunSummary[], ctid?: string): MappingResult[] {
    return runs.map(run => this.processRun(run, ctid));
  }

  private findRule(run: WorkflowRunSummary): CICDMappingRule | undefined {
    return this.rules.find(
      rule =>
        (rule.stage === run.stage || rule.stage === '*') &&
        rule.conclusion === run.conclusion
    );
  }

  addRule(rule: CICDMappingRule): void {
    this.rules.unshift(rule);
  }
}
