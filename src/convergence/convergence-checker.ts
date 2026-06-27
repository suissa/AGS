import { AgentOutput } from './convergence-state.js';

export interface ConvergenceCheckResult {
  converged: boolean;
  reasons: string[];
}

export class ConvergenceChecker {
  check(outputs: AgentOutput[]): ConvergenceCheckResult {
    const reasons: string[] = [];

    if (outputs.length === 0) {
      return { converged: false, reasons: ['No agent outputs to evaluate'] };
    }

    const allTestsPass = outputs.every(o => o.testsPass);
    if (!allTestsPass) {
      reasons.push('Some agents report failing tests');
    }

    const noConflicts = outputs.every(o => !o.hasConflicts);
    if (!noConflicts) {
      reasons.push('Conflicts detected in agent outputs');
    }

    const noBlockingIssues = outputs.every(o => o.issues.length === 0);
    if (!noBlockingIssues) {
      const allIssues = outputs.flatMap(o => o.issues);
      reasons.push(`Blocking issues found: ${allIssues.join('; ')}`);
    }

    const converged = allTestsPass && noConflicts && noBlockingIssues;
    if (converged) reasons.push('All convergence criteria met');

    return { converged, reasons };
  }
}
