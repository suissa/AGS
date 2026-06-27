import { GitHubWorkflowRun } from '../github/types.js';
import { WorkflowRunSummary, CICDStage } from './cicd-types.js';

const STAGE_KEYWORDS: Record<CICDStage, string[]> = {
  lint: ['lint', 'eslint', 'tslint', 'style'],
  test: ['test', 'jest', 'vitest', 'unit', 'spec'],
  build: ['build', 'compile', 'bundle', 'webpack', 'vite'],
  sonar: ['sonar', 'quality', 'code-quality'],
  e2e: ['e2e', 'cypress', 'playwright', 'integration'],
  docker: ['docker', 'container', 'image'],
  deploy: ['deploy', 'release', 'publish', 'ship'],
  sentry: ['sentry'],
  snyk: ['snyk', 'security-scan'],
  dependabot: ['dependabot'],
  review: ['review', 'copilot', 'kilocode'],
};

function detectStage(name: string): CICDStage {
  const lower = name.toLowerCase();
  for (const [stage, keywords] of Object.entries(STAGE_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) {
      return stage as CICDStage;
    }
  }
  return 'build';
}

export function parseWorkflowRun(run: GitHubWorkflowRun): WorkflowRunSummary {
  return {
    id: run.id,
    name: run.name,
    stage: detectStage(run.name),
    status: run.status,
    conclusion: run.conclusion,
    branch: run.head_branch,
    sha: run.head_sha,
    url: run.html_url,
    createdAt: run.created_at,
  };
}

export function parseWorkflowRuns(runs: GitHubWorkflowRun[]): WorkflowRunSummary[] {
  return runs.map(parseWorkflowRun);
}
