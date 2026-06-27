import { getAuthHeaders } from './github-auth.js';
import { createGitHubError } from './github-errors.js';
import {
  GitHubRepository,
  GitHubIssue,
  GitHubLabel,
  GitHubMilestone,
  GitHubWorkflowRun,
  GitHubPullRequest,
  CreateRepositoryInput,
  CreateIssueInput,
  CreateIssueCommentInput,
  CreateLabelInput,
  CreateMilestoneInput,
  GetIssueInput,
  ListIssuesInput,
  CreateOrUpdateFileInput,
  ListWorkflowRunsInput,
  GetPullRequestInput,
} from './types.js';

const BASE_URL = 'https://api.github.com';

export class GitHubRestClient {
  private token?: string;

  constructor(token?: string) {
    this.token = token;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const headers = getAuthHeaders(this.token);
    const url = `${BASE_URL}${path}`;

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    let responseBody: unknown;
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      responseBody = await response.json();
    } else {
      responseBody = await response.text();
    }

    if (!response.ok) {
      throw createGitHubError(response.status, response.statusText, responseBody, path);
    }

    return responseBody as T;
  }

  async createRepository(input: CreateRepositoryInput): Promise<GitHubRepository> {
    return this.request<GitHubRepository>('POST', '/user/repos', input);
  }

  async createIssue(input: CreateIssueInput): Promise<GitHubIssue> {
    const { owner, repo, ...body } = input;
    return this.request<GitHubIssue>('POST', `/repos/${owner}/${repo}/issues`, body);
  }

  async createIssueComment(input: CreateIssueCommentInput): Promise<{ id: number; body: string }> {
    const { owner, repo, issueNumber, body } = input;
    return this.request('POST', `/repos/${owner}/${repo}/issues/${issueNumber}/comments`, { body });
  }

  async createLabel(input: CreateLabelInput): Promise<GitHubLabel> {
    const { owner, repo, ...body } = input;
    return this.request<GitHubLabel>('POST', `/repos/${owner}/${repo}/labels`, body);
  }

  async createMilestone(input: CreateMilestoneInput): Promise<GitHubMilestone> {
    const { owner, repo, ...body } = input;
    return this.request<GitHubMilestone>('POST', `/repos/${owner}/${repo}/milestones`, body);
  }

  async getIssue(input: GetIssueInput): Promise<GitHubIssue> {
    const { owner, repo, issueNumber } = input;
    return this.request<GitHubIssue>('GET', `/repos/${owner}/${repo}/issues/${issueNumber}`);
  }

  async listIssues(input: ListIssuesInput): Promise<GitHubIssue[]> {
    const { owner, repo, state = 'open', labels, per_page = 30, page = 1 } = input;
    const params = new URLSearchParams({ state, per_page: String(per_page), page: String(page) });
    if (labels) params.set('labels', labels);
    return this.request<GitHubIssue[]>('GET', `/repos/${owner}/${repo}/issues?${params}`);
  }

  async createOrUpdateFile(input: CreateOrUpdateFileInput): Promise<{ content: { sha: string } }> {
    const { owner, repo, path, ...body } = input;
    const encodedContent = Buffer.from(body.content, 'utf-8').toString('base64');
    return this.request('PUT', `/repos/${owner}/${repo}/contents/${path}`, {
      ...body,
      content: encodedContent,
    });
  }

  async listWorkflowRuns(input: ListWorkflowRunsInput): Promise<{ workflow_runs: GitHubWorkflowRun[] }> {
    const { owner, repo, workflow_id, branch, per_page = 10 } = input;
    const params = new URLSearchParams({ per_page: String(per_page) });
    if (branch) params.set('branch', branch);
    const path = workflow_id
      ? `/repos/${owner}/${repo}/actions/workflows/${workflow_id}/runs?${params}`
      : `/repos/${owner}/${repo}/actions/runs?${params}`;
    return this.request('GET', path);
  }

  async getPullRequest(input: GetPullRequestInput): Promise<GitHubPullRequest> {
    const { owner, repo, pullNumber } = input;
    return this.request<GitHubPullRequest>('GET', `/repos/${owner}/${repo}/pulls/${pullNumber}`);
  }
}
