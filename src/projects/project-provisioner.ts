import { GitHubGraphQLClient } from './github-graphql-client.js';
import { ProjectMode, getProjectNames } from './project-mode.js';
import { COMMON_FIELDS, MINIMAL_FIELDS, ProjectField } from './project-fields.js';

export interface ProvisionedProject {
  id: string;
  number: number;
  title: string;
  isNew: boolean;
}

export interface ProjectProvisionerOptions {
  owner: string;
  mode: ProjectMode;
  dryRun?: boolean;
  token?: string;
}

export class ProjectProvisioner {
  private client: GitHubGraphQLClient;
  private options: ProjectProvisionerOptions;

  constructor(options: ProjectProvisionerOptions) {
    this.options = options;
    this.client = new GitHubGraphQLClient(options.token);
  }

  async provision(): Promise<ProvisionedProject[]> {
    const { owner, mode, dryRun } = this.options;

    if (dryRun) {
      return this.dryRunProvision();
    }

    const projectNames = getProjectNames(mode);
    const fields = mode === 'simple' ? MINIMAL_FIELDS : COMMON_FIELDS;

    const isOrg = await this.isOrganization(owner);
    const ownerId = isOrg
      ? await this.client.getOrganizationId(owner)
      : await this.client.getUserId();

    if (!ownerId) {
      throw new Error(`Cannot resolve owner ID for "${owner}"`);
    }

    const existing = await this.client.listProjects(owner, isOrg);
    const existingByTitle = new Map(existing.map(p => [p.title, p]));

    const results: ProvisionedProject[] = [];

    for (const name of projectNames) {
      const existingProject = existingByTitle.get(name);

      if (existingProject) {
        console.log(`[provisioner] Project "${name}" already exists (#${existingProject.number}), skipping.`);
        results.push({ ...existingProject, isNew: false });
        continue;
      }

      console.log(`[provisioner] Creating project "${name}"...`);
      const project = await this.client.createProject(ownerId, name);

      await this.addFields(project.id, fields);

      results.push({ ...project, isNew: true });
      console.log(`[provisioner] Created project "${name}" (#${project.number})`);
    }

    return results;
  }

  private async addFields(projectId: string, fields: ProjectField[]): Promise<void> {
    for (const field of fields) {
      try {
        await this.client.addProjectField(projectId, field.name, field.dataType);
      } catch (err) {
        // Field may already exist; non-fatal
        console.warn(`[provisioner] Field "${field.name}" skipped: ${(err as Error).message}`);
      }
    }
  }

  private async isOrganization(owner: string): Promise<boolean> {
    const orgId = await this.client.getOrganizationId(owner);
    return orgId !== null;
  }

  private dryRunProvision(): ProvisionedProject[] {
    const projectNames = getProjectNames(this.options.mode);
    console.log(`[dry-run] Would provision ${projectNames.length} project(s) for "${this.options.owner}":`);
    return projectNames.map((name, i) => ({
      id: `dry-run-id-${i}`,
      number: i + 1,
      title: name,
      isNew: true,
    }));
  }
}
