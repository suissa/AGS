import { CICDMappingRule } from './cicd-types.js';

export const DEFAULT_CICD_RULES: CICDMappingRule[] = [
  {
    stage: 'lint',
    conclusion: 'failure',
    agsEvent: 'ci.failed',
    projectStatus: 'Blocked',
    description: 'Lint failed -> Blocked',
  },
  {
    stage: 'test',
    conclusion: 'failure',
    agsEvent: 'ci.failed',
    projectStatus: 'Bug Tracker',
    description: 'Test failed -> Bug Tracker',
  },
  {
    stage: 'build',
    conclusion: 'failure',
    agsEvent: 'ci.failed',
    projectStatus: 'Blocked',
    description: 'Build failed -> Blocked',
  },
  {
    stage: 'sonar',
    conclusion: 'failure',
    agsEvent: 'ci.failed',
    projectStatus: 'Quality Issue',
    description: 'Sonar failed -> Quality Issue',
  },
  {
    stage: 'e2e',
    conclusion: 'failure',
    agsEvent: 'ci.failed',
    projectStatus: 'Bug Tracker',
    description: 'E2E failed -> Bug Tracker',
  },
  {
    stage: 'docker',
    conclusion: 'failure',
    agsEvent: 'ci.failed',
    projectStatus: 'Deployment Blocked',
    description: 'Docker failed -> Deployment Blocked',
  },
  {
    stage: 'deploy',
    conclusion: 'success',
    agsEvent: 'ci.success',
    projectStatus: 'Done/Released',
    description: 'Deploy success -> Done/Released',
  },
  {
    stage: 'dependabot',
    conclusion: 'failure',
    agsEvent: 'dependabot.alert',
    projectStatus: 'Security',
    description: 'Dependabot alert -> Security',
  },
  {
    stage: 'snyk',
    conclusion: 'failure',
    agsEvent: 'security.alert',
    projectStatus: 'Security',
    description: 'Snyk failed -> Security',
  },
  {
    stage: '*',
    conclusion: 'success',
    agsEvent: 'ci.success',
    description: 'Generic CI success',
  },
  {
    stage: '*',
    conclusion: 'failure',
    agsEvent: 'ci.failed',
    description: 'Generic CI failure',
  },
];
