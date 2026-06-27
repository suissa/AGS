import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';
import { ConvergenceState } from './convergence-state.js';

export class ContextArtifactWriter {
  private cwd: string;

  constructor(cwd: string = process.cwd()) {
    this.cwd = cwd;
  }

  write(state: ConvergenceState): string {
    const dir = resolve(this.cwd, '.ags/contexts');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    const filename = `${state.taskId}-context-${Date.now()}.txt`;
    const path = resolve(dir, filename);

    const content = this.buildContent(state);
    writeFileSync(path, content, 'utf-8');

    return path;
  }

  private buildContent(state: ConvergenceState): string {
    const lines: string[] = [];

    lines.push(`# AGS Convergence Context`);
    lines.push(`Task: ${state.taskId}`);
    if (state.ctid) lines.push(`CTID: ${state.ctid}`);
    lines.push(`Status: ${state.status}`);
    lines.push(`Iterations: ${state.iteration}/${state.maxIterations}`);
    lines.push(`Started: ${state.startedAt}`);
    if (state.finishedAt) lines.push(`Finished: ${state.finishedAt}`);

    lines.push('\n## Agent Outputs');
    for (const output of state.outputs) {
      lines.push(`\n### Agent: ${output.agentId}`);
      lines.push(`Tests: ${output.testsPass ? 'PASS' : 'FAIL'}`);
      lines.push(`Conflicts: ${output.hasConflicts ? 'YES' : 'NO'}`);
      if (output.issues.length > 0) {
        lines.push(`Issues: ${output.issues.join(', ')}`);
      }
      lines.push(output.content);
    }

    if (state.unifiedOutput) {
      lines.push('\n## Unified Output');
      lines.push(state.unifiedOutput);
    }

    return lines.join('\n');
  }
}
