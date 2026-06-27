import { AGSEventType } from '../events/event-types.js';

export type RuleAction =
  | 'add_to_project'
  | 'move_project_item'
  | 'set_field'
  | 'create_issue_comment'
  | 'create_bug_issue'
  | 'create_security_issue'
  | 'attach_ctid'
  | 'write_trace';

export interface RuleActionConfig {
  type: RuleAction;
  project?: string;
  status?: string;
  field?: string;
  value?: string;
  comment?: string;
}

export interface SyncRule {
  id: string;
  event: AGSEventType;
  description: string;
  actions: RuleActionConfig[];
  enabled: boolean;
}

export interface RuleExecutionContext {
  event: {
    type: AGSEventType;
    ctid?: string;
    payload: Record<string, unknown>;
  };
  config: {
    owner: string;
    repo: string;
    mode: string;
    dryRun: boolean;
  };
}

export interface RuleExecutionResult {
  ruleId: string;
  actionsExecuted: string[];
  success: boolean;
  error?: string;
}
