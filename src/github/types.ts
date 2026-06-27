export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  clone_url: string;
  default_branch: string;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body?: string;
  state: 'open' | 'closed';
  html_url: string;
  labels: Array<{ name: string; color: string }>;
  milestone?: { number: number; title: string };
}

export interface GitHubLabel {
  id: number;
  name: string;
  color: string;
  description?: string;
}

export interface GitHubMilestone {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed';
  description?: string;
}

export interface GitHubWorkflowRun {
  id: number;
  name: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion: 'success' | 'failure' | 'cancelled' | 'skipped' | null;
  html_url: string;
  created_at: string;
  updated_at: string;
  head_branch: string;
  head_sha: string;
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body?: string;
  state: 'open' | 'closed';
  merged: boolean;
  html_url: string;
  head: { ref: string; sha: string };
  base: { ref: string };
}

export interface CreateRepositoryInput {
  name: string;
  description?: string;
  private?: boolean;
  auto_init?: boolean;
}

export interface CreateIssueInput {
  owner: string;
  repo: string;
  title: string;
  body?: string;
  labels?: string[];
  milestone?: number;
}

export interface CreateIssueCommentInput {
  owner: string;
  repo: string;
  issueNumber: number;
  body: string;
}

export interface CreateLabelInput {
  owner: string;
  repo: string;
  name: string;
  color: string;
  description?: string;
}

export interface CreateMilestoneInput {
  owner: string;
  repo: string;
  title: string;
  description?: string;
  due_on?: string;
}

export interface GetIssueInput {
  owner: string;
  repo: string;
  issueNumber: number;
}

export interface ListIssuesInput {
  owner: string;
  repo: string;
  state?: 'open' | 'closed' | 'all';
  labels?: string;
  per_page?: number;
  page?: number;
}

export interface CreateOrUpdateFileInput {
  owner: string;
  repo: string;
  path: string;
  message: string;
  content: string;
  branch?: string;
  sha?: string;
}

export interface ListWorkflowRunsInput {
  owner: string;
  repo: string;
  workflow_id?: string | number;
  branch?: string;
  per_page?: number;
}

export interface GetPullRequestInput {
  owner: string;
  repo: string;
  pullNumber: number;
}
