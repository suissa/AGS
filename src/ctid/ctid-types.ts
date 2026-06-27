export type CTIDStatus =
  | 'pending'
  | 'in_progress'
  | 'converged'
  | 'failed'
  | 'blocked';

export interface CTIDRecord {
  ctid: string;
  repoSlug: string;
  issueNumber: number;
  shortHash: string;
  status: CTIDStatus;
  branch?: string;
  prNumber?: number;
  agentsUsed?: string[];
  createdAt: string;
  updatedAt: string;
}
