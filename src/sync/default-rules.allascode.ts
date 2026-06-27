import { SyncRule } from './rule-types.js';

export const DEFAULT_RULES_ALLASCODE: SyncRule[] = [
  {
    id: 'allascode-task-created',
    event: 'task.created',
    description: 'Add new task to Backlog',
    actions: [
      { type: 'add_to_project', project: 'AGS - Backlog' },
      { type: 'attach_ctid' },
    ],
    enabled: true,
  },
  {
    id: 'allascode-branch-created',
    event: 'branch.created',
    description: 'Move task to Execution / In Progress when branch is created',
    actions: [
      { type: 'add_to_project', project: 'AGS - Execution' },
      { type: 'move_project_item', project: 'AGS - Execution', status: 'In Progress' },
    ],
    enabled: true,
  },
  {
    id: 'allascode-pr-opened',
    event: 'pr.opened',
    description: 'Move task to Execution / In Review when PR is opened',
    actions: [
      { type: 'move_project_item', project: 'AGS - Execution', status: 'In Review' },
    ],
    enabled: true,
  },
  {
    id: 'allascode-ci-failed',
    event: 'ci.failed',
    description: 'Create bug and block task when CI fails',
    actions: [
      { type: 'create_bug_issue' },
      { type: 'add_to_project', project: 'AGS - Bug Tracker' },
      { type: 'move_project_item', project: 'AGS - Execution', status: 'Blocked' },
      { type: 'write_trace' },
    ],
    enabled: true,
  },
  {
    id: 'allascode-llm-used',
    event: 'llm.used',
    description: 'Record LLM usage in Cognitive project',
    actions: [
      { type: 'add_to_project', project: 'AGS - Cognitive' },
      { type: 'write_trace' },
    ],
    enabled: true,
  },
  {
    id: 'allascode-dependabot-alert',
    event: 'dependabot.alert',
    description: 'Add dependabot alert to Security project',
    actions: [
      { type: 'create_security_issue' },
      { type: 'add_to_project', project: 'AGS - Security' },
    ],
    enabled: true,
  },
  {
    id: 'allascode-security-alert',
    event: 'security.alert',
    description: 'Add security alert to Security project',
    actions: [
      { type: 'create_security_issue' },
      { type: 'add_to_project', project: 'AGS - Security' },
    ],
    enabled: true,
  },
  {
    id: 'allascode-pr-merged',
    event: 'pr.merged',
    description: 'Mark task as Done when PR is merged',
    actions: [
      { type: 'move_project_item', project: 'AGS - Execution', status: 'Done' },
    ],
    enabled: true,
  },
  {
    id: 'allascode-task-converged',
    event: 'task.converged',
    description: 'Record convergence in Cognitive and trigger Wiki snapshot',
    actions: [
      { type: 'add_to_project', project: 'AGS - Cognitive' },
      { type: 'write_trace' },
    ],
    enabled: true,
  },
];
