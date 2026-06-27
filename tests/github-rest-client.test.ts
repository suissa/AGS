import { GitHubRestClient } from '../src/github/github-rest-client.js';
import { GitHubAuthError, GitHubNotFoundError, GitHubValidationError, GitHubForbiddenError } from '../src/github/github-errors.js';

function mockFetch(status: number, body: unknown, statusText = ''): typeof fetch {
  return () =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      statusText,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve(body),
      text: () => Promise.resolve(JSON.stringify(body)),
    } as unknown as Response);
}

describe('GitHubRestClient', () => {
  const client = new GitHubRestClient('test-token');

  it('creates a repository', async () => {
    const mockRepo = { id: 1, name: 'my-repo', full_name: 'owner/my-repo', private: false, html_url: '', clone_url: '', default_branch: 'main' };
    global.fetch = mockFetch(201, mockRepo) as typeof fetch;

    const result = await client.createRepository({ name: 'my-repo' });
    expect(result.name).toBe('my-repo');
  });

  it('creates an issue', async () => {
    const mockIssue = { id: 1, number: 42, title: 'Bug fix', state: 'open', html_url: '', labels: [] };
    global.fetch = mockFetch(201, mockIssue) as typeof fetch;

    const result = await client.createIssue({ owner: 'o', repo: 'r', title: 'Bug fix' });
    expect(result.number).toBe(42);
  });

  it('throws GitHubAuthError on 401', async () => {
    global.fetch = mockFetch(401, { message: 'Bad credentials' }, 'Unauthorized') as typeof fetch;
    await expect(client.getIssue({ owner: 'o', repo: 'r', issueNumber: 1 })).rejects.toThrow(GitHubAuthError);
  });

  it('throws GitHubForbiddenError on 403', async () => {
    global.fetch = mockFetch(403, { message: 'Forbidden' }, 'Forbidden') as typeof fetch;
    await expect(client.getIssue({ owner: 'o', repo: 'r', issueNumber: 1 })).rejects.toThrow(GitHubForbiddenError);
  });

  it('throws GitHubNotFoundError on 404', async () => {
    global.fetch = mockFetch(404, { message: 'Not Found' }, 'Not Found') as typeof fetch;
    await expect(client.getIssue({ owner: 'o', repo: 'r', issueNumber: 999 })).rejects.toThrow(GitHubNotFoundError);
  });

  it('throws GitHubValidationError on 422', async () => {
    global.fetch = mockFetch(422, { message: 'Validation Failed' }, 'Unprocessable Entity') as typeof fetch;
    await expect(client.createIssue({ owner: 'o', repo: 'r', title: '' })).rejects.toThrow(GitHubValidationError);
  });

  it('lists issues', async () => {
    const issues = [{ id: 1, number: 1, title: 'Test', state: 'open', html_url: '', labels: [] }];
    global.fetch = mockFetch(200, issues) as typeof fetch;
    const result = await client.listIssues({ owner: 'o', repo: 'r' });
    expect(result).toHaveLength(1);
  });
});
