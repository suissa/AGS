export function getGitHubToken(): string {
  const token = process.env['GITHUB_TOKEN'];
  if (!token) {
    throw new Error('GITHUB_TOKEN environment variable is not set.');
  }
  return token;
}

export function getAuthHeaders(token?: string): Record<string, string> {
  const t = token ?? getGitHubToken();
  return {
    'Authorization': `Bearer ${t}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  };
}
