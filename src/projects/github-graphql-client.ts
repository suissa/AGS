import { getAuthHeaders } from '../github/github-auth.js';

const GRAPHQL_URL = 'https://api.github.com/graphql';

export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string; locations?: unknown[] }>;
}

export class GitHubGraphQLClient {
  private token?: string;

  constructor(token?: string) {
    this.token = token;
  }

  async query<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    const headers = getAuthHeaders(this.token);

    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json() as GraphQLResponse<T>;

    if (result.errors?.length) {
      throw new Error(`GraphQL errors: ${result.errors.map(e => e.message).join(', ')}`);
    }

    if (!result.data) {
      throw new Error('GraphQL response has no data');
    }

    return result.data;
  }

  async getViewerLogin(): Promise<string> {
    const data = await this.query<{ viewer: { login: string } }>(`
      query { viewer { login } }
    `);
    return data.viewer.login;
  }

  async getOrganizationId(login: string): Promise<string | null> {
    try {
      const data = await this.query<{ organization: { id: string } | null }>(`
        query($login: String!) {
          organization(login: $login) { id }
        }
      `, { login });
      return data.organization?.id ?? null;
    } catch {
      return null;
    }
  }

  async getUserId(): Promise<string> {
    const data = await this.query<{ viewer: { id: string } }>(`
      query { viewer { id } }
    `);
    return data.viewer.id;
  }

  async createProject(ownerId: string, title: string): Promise<{ id: string; number: number; title: string }> {
    const data = await this.query<{ createProjectV2: { projectV2: { id: string; number: number; title: string } } }>(`
      mutation($ownerId: ID!, $title: String!) {
        createProjectV2(input: { ownerId: $ownerId, title: $title }) {
          projectV2 { id number title }
        }
      }
    `, { ownerId, title });
    return data.createProjectV2.projectV2;
  }

  async listProjects(login: string, isOrg: boolean): Promise<Array<{ id: string; title: string; number: number }>> {
    if (isOrg) {
      const data = await this.query<{ organization: { projectsV2: { nodes: Array<{ id: string; title: string; number: number }> } } }>(`
        query($login: String!) {
          organization(login: $login) {
            projectsV2(first: 20) { nodes { id title number } }
          }
        }
      `, { login });
      return data.organization?.projectsV2?.nodes ?? [];
    } else {
      const data = await this.query<{ user: { projectsV2: { nodes: Array<{ id: string; title: string; number: number }> } } }>(`
        query($login: String!) {
          user(login: $login) {
            projectsV2(first: 20) { nodes { id title number } }
          }
        }
      `, { login });
      return data.user?.projectsV2?.nodes ?? [];
    }
  }

  async addProjectField(projectId: string, name: string, dataType: string): Promise<{ id: string }> {
    const data = await this.query<{ createProjectV2Field: { projectV2Field: { id: string } } }>(`
      mutation($projectId: ID!, $name: String!, $dataType: ProjectV2CustomFieldType!) {
        createProjectV2Field(input: { projectId: $projectId, name: $name, dataType: $dataType }) {
          projectV2Field { ... on ProjectV2Field { id } }
        }
      }
    `, { projectId, name, dataType });
    return data.createProjectV2Field.projectV2Field;
  }
}
