export type ProjectMode = 'simple' | 'allascode';

export const PROJECT_NAMES_SIMPLE = ['AGS - Execution'] as const;

export const PROJECT_NAMES_ALLASCODE = [
  'AGS - Backlog',
  'AGS - Execution',
  'AGS - Bug Tracker',
  'AGS - Cognitive',
  'AGS - Security',
] as const;

export function getProjectNames(mode: ProjectMode): string[] {
  return mode === 'simple' ? [...PROJECT_NAMES_SIMPLE] : [...PROJECT_NAMES_ALLASCODE];
}
