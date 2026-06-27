export type CICDStage =
  | 'lint'
  | 'test'
  | 'build'
  | 'sonar'
  | 'e2e'
  | 'docker'
  | 'deploy'
  | 'sentry'
  | 'snyk'
  | 'dependabot'
  | 'review'
  | string;

export type CICDConclusion = 'success' | 'failure' | 'cancelled' | 'skipped' | null;

export interface WorkflowRunSummary {
  id: number;
  name: string;
  stage: CICDStage;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion: CICDConclusion;
  branch: string;
  sha: string;
  url: string;
  createdAt: string;
}

export type CICDProjectStatus =
  | 'Blocked'
  | 'Bug Tracker'
  | 'Quality Issue'
  | 'Deployment Blocked'
  | 'Security'
  | 'Done/Released';

export interface CICDMappingRule {
  stage: CICDStage | '*';
  conclusion: CICDConclusion;
  agsEvent: string;
  projectStatus?: CICDProjectStatus;
  description: string;
}
