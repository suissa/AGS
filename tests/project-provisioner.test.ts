import { ProjectProvisioner } from '../src/projects/project-provisioner.js';

describe('ProjectProvisioner', () => {
  it('dry-run simple mode creates 1 project', async () => {
    const provisioner = new ProjectProvisioner({ owner: 'suissa', mode: 'simple', dryRun: true });
    const projects = await provisioner.provision();
    expect(projects).toHaveLength(1);
    expect(projects[0].title).toBe('AGS - Execution');
  });

  it('dry-run allascode mode creates 5 projects', async () => {
    const provisioner = new ProjectProvisioner({ owner: 'suissa', mode: 'allascode', dryRun: true });
    const projects = await provisioner.provision();
    expect(projects).toHaveLength(5);
    const titles = projects.map(p => p.title);
    expect(titles).toContain('AGS - Backlog');
    expect(titles).toContain('AGS - Execution');
    expect(titles).toContain('AGS - Bug Tracker');
    expect(titles).toContain('AGS - Cognitive');
    expect(titles).toContain('AGS - Security');
  });

  it('dry-run marks all projects as new', async () => {
    const provisioner = new ProjectProvisioner({ owner: 'suissa', mode: 'simple', dryRun: true });
    const projects = await provisioner.provision();
    expect(projects.every(p => p.isNew)).toBe(true);
  });
});
