import { TUIState, CIStatus } from './tui-state.js';

const WIDTH = 52;

function line(content: string = ''): string {
  return `│ ${content.padEnd(WIDTH - 2)} │`;
}

function header(title: string): string {
  const pad = WIDTH - title.length - 4;
  return `├ ${title} ${'─'.repeat(Math.max(0, pad))}┤`;
}

function ciIcon(status: CIStatus['status']): string {
  switch (status) {
    case 'ok': return '✓';
    case 'running': return '…';
    case 'failed': return '✗';
    case 'pending': return '○';
  }
}

export function renderTUI(state: TUIState): string {
  const rows: string[] = [];

  rows.push(`┌ AGS Runtime ${'─'.repeat(WIDTH - 14)}┐`);
  rows.push(line(`Mode: ${state.mode} | Repo: ${state.repo}`));

  rows.push(header('Projects'));
  if (state.projects.length === 0) {
    rows.push(line('(no projects)'));
  } else {
    const projectLine = state.projects.map(p => `${p.name.replace('AGS - ', '')}: ${p.count}`).join(' | ');
    rows.push(line(projectLine));
  }

  rows.push(header('Events'));
  const events = state.recentEvents.slice(0, 3);
  if (events.length === 0) {
    rows.push(line('(no events yet)'));
  } else {
    for (const ev of events) {
      const ts = ev.createdAt.slice(11, 19);
      rows.push(line(`${ts} ${ev.type}${ev.ctid ? ` [${ev.ctid.slice(0, 16)}...]` : ''}`));
    }
  }

  rows.push(header('Agents'));
  if (state.agents.length === 0) {
    rows.push(line('(no agents)'));
  } else {
    for (const agent of state.agents.slice(0, 3)) {
      rows.push(line(`${agent.name} ${agent.status}`));
    }
  }

  rows.push(header('CI/CD'));
  if (state.ciStatus.length === 0) {
    rows.push(line('(no CI status)'));
  } else {
    const ciLine = state.ciStatus.map(c => `${c.stage} ${ciIcon(c.status)}`).join(' | ');
    rows.push(line(ciLine));
  }

  if (state.errors.length > 0) {
    rows.push(header('Errors'));
    for (const err of state.errors.slice(0, 2)) {
      rows.push(line(`✗ ${err.slice(0, WIDTH - 6)}`));
    }
  }

  rows.push(`└${'─'.repeat(WIDTH)}┘`);

  return rows.join('\n');
}
