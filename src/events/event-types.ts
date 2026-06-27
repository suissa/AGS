export type AGSEventType =
  | 'task.created'
  | 'task.converged'
  | 'task.failed'
  | 'branch.created'
  | 'commit.pushed'
  | 'pr.opened'
  | 'pr.merged'
  | 'ci.started'
  | 'ci.success'
  | 'ci.failed'
  | 'llm.used'
  | 'dependabot.alert'
  | 'security.alert'
  | 'agent.started'
  | 'agent.completed'
  | 'agent.failed'
  | 'wiki.updated'
  | 'provenance.generated'
  | string;

export interface AGSEvent {
  id: string;
  type: AGSEventType;
  ctid?: string;
  source: string;
  payload: Record<string, unknown>;
  createdAt: string;
}
