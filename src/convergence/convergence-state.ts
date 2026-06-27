export type ConvergenceStatus = 'running' | 'converged' | 'failed' | 'pending';

export interface AgentOutput {
  agentId: string;
  content: string;
  testsPass: boolean;
  hasConflicts: boolean;
  issues: string[];
}

export interface ConvergenceState {
  taskId: string;
  ctid?: string;
  iteration: number;
  maxIterations: number;
  status: ConvergenceStatus;
  outputs: AgentOutput[];
  unifiedOutput?: string;
  startedAt: string;
  finishedAt?: string;
}

export function createInitialConvergenceState(
  taskId: string,
  maxIterations: number,
  ctid?: string
): ConvergenceState {
  return {
    taskId,
    ctid,
    iteration: 0,
    maxIterations,
    status: 'pending',
    outputs: [],
    startedAt: new Date().toISOString(),
  };
}
