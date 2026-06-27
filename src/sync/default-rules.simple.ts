import { SyncRule } from './rule-types.js';

export const DEFAULT_RULES_SIMPLE: SyncRule[] = [
  {
    id: 'simple-task-created',
    event: 'task.created',
    description: 'Add new task to Execution project',
    actions: [
      { type: 'add_to_project', project: 'AGS - Execution' },
      { type: 'attach_ctid' },
    ],
    enabled: true,
  },
  {
    id: 'simple-pr-opened',
    event: 'pr.opened',
    description: 'Move item to In Review when PR is opened',
    actions: [
      { type: 'move_project_item', project: 'AGS - Execution', status: 'In Review' },
    ],
    enabled: true,
  },
  {
    id: 'simple-ci-failed',
    event: 'ci.failed',
    description: 'Move item to Blocked when CI fails',
    actions: [
      { type: 'move_project_item', project: 'AGS - Execution', status: 'Blocked' },
      { type: 'write_trace' },
    ],
    enabled: true,
  },
  {
    id: 'simple-pr-merged',
    event: 'pr.merged',
    description: 'Move item to Done when PR is merged',
    actions: [
      { type: 'move_project_item', project: 'AGS - Execution', status: 'Done' },
    ],
    enabled: true,
  },
];
