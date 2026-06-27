export class GitHubError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body: unknown,
    message?: string
  ) {
    super(message ?? `GitHub API error ${status}: ${statusText}`);
    this.name = 'GitHubError';
  }
}

export class GitHubAuthError extends GitHubError {
  constructor(body: unknown) {
    super(401, 'Unauthorized', body, 'GitHub authentication failed. Check your GITHUB_TOKEN.');
    this.name = 'GitHubAuthError';
  }
}

export class GitHubForbiddenError extends GitHubError {
  constructor(body: unknown) {
    super(403, 'Forbidden', body, 'GitHub access forbidden. Insufficient token permissions.');
    this.name = 'GitHubForbiddenError';
  }
}

export class GitHubNotFoundError extends GitHubError {
  constructor(resource: string, body: unknown) {
    super(404, 'Not Found', body, `GitHub resource not found: ${resource}`);
    this.name = 'GitHubNotFoundError';
  }
}

export class GitHubValidationError extends GitHubError {
  constructor(body: unknown) {
    super(422, 'Unprocessable Entity', body, `GitHub validation error: ${JSON.stringify(body)}`);
    this.name = 'GitHubValidationError';
  }
}

export function createGitHubError(status: number, statusText: string, body: unknown, resource?: string): GitHubError {
  switch (status) {
    case 401: return new GitHubAuthError(body);
    case 403: return new GitHubForbiddenError(body);
    case 404: return new GitHubNotFoundError(resource ?? 'unknown', body);
    case 422: return new GitHubValidationError(body);
    default: return new GitHubError(status, statusText, body);
  }
}
