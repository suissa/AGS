import { AGSEvent } from '../events/event-types.js';

export interface AgentStatus {
  name: string;
  status: 'running' | 'idle' | 'failed' | 'completed';
}

export interface CIStatus {
  stage: string;
  status: 'ok' | 'running' | 'pending' | 'failed';
}

export interface ProjectCount {
  name: string;
  count: number;
}

export interface TUIState {
  mode: string;
  repo: string;
  projects: ProjectCount[];
  recentEvents: AGSEvent[];
  agents: AgentStatus[];
  ciStatus: CIStatus[];
  errors: string[];
  lastUpdated: string;
}

export function createInitialTUIState(mode: string, repo: string): TUIState {
  return {
    mode,
    repo,
    projects: [],
    recentEvents: [],
    agents: [],
    ciStatus: [],
    errors: [],
    lastUpdated: new Date().toISOString(),
  };
}

export function applyEventToState(state: TUIState, event: AGSEvent): TUIState {
  const MAX_EVENTS = 10;

  const newState: TUIState = {
    ...state,
    recentEvents: [event, ...state.recentEvents].slice(0, MAX_EVENTS),
    lastUpdated: new Date().toISOString(),
  };

  if (event.type === 'agent.started') {
    const name = String(event.payload['name'] ?? 'unknown');
    const existing = newState.agents.findIndex(a => a.name === name);
    if (existing >= 0) {
      newState.agents[existing] = { name, status: 'running' };
    } else {
      newState.agents = [...newState.agents, { name, status: 'running' }];
    }
  }

  if (event.type === 'agent.completed') {
    const name = String(event.payload['name'] ?? 'unknown');
    newState.agents = newState.agents.map(a => a.name === name ? { ...a, status: 'completed' } : a);
  }

  if (event.type === 'ci.started' || event.type === 'ci.success' || event.type === 'ci.failed') {
    const stage = String(event.payload['stage'] ?? 'ci');
    const statusMap: Record<string, CIStatus['status']> = {
      'ci.started': 'running',
      'ci.success': 'ok',
      'ci.failed': 'failed',
    };
    const existing = newState.ciStatus.findIndex(c => c.stage === stage);
    const updated: CIStatus = { stage, status: statusMap[event.type] ?? 'pending' };
    if (existing >= 0) {
      newState.ciStatus[existing] = updated;
    } else {
      newState.ciStatus = [...newState.ciStatus, updated];
    }
  }

  return newState;
}
