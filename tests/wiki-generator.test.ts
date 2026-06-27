import { WikiGenerator } from '../src/wiki/wiki-generator.js';
import { generateChangelog, generateCTIDIndex } from '../src/wiki/changelog-generator.js';
import { generateVersionPage } from '../src/wiki/version-snapshot.js';
import { tmpdir } from 'os';
import { join } from 'path';
import { existsSync } from 'fs';

const TMP = join(tmpdir(), `ags-wiki-test-${Date.now()}`);

describe('WikiGenerator', () => {
  const gen = new WikiGenerator({
    owner: 'suissa',
    repo: 'ags',
    version: '0.1.0',
    dryRun: true,
    cwd: TMP,
  });

  it('generates Home.md', () => {
    const content = gen.generateHome('AGS', 'Agentic GitHub System');
    expect(content).toContain('# AGS');
    expect(content).toContain('Changelog');
  });

  it('generates Changelog.md', () => {
    const content = gen.generateChangelog([
      { version: '0.1.0', date: '2026-06-27', changes: ['Initial release'], ctids: [] },
    ]);
    expect(content).toContain('0.1.0');
    expect(content).toContain('Initial release');
  });

  it('generates CTID index', () => {
    const content = gen.generateCTIDIndex([
      {
        ctid: 'ctid_ags_1_aabbccdd',
        repoSlug: 'ags',
        issueNumber: 1,
        shortHash: 'aabbccdd',
        status: 'converged',
        createdAt: '2026-06-27T00:00:00Z',
        updatedAt: '2026-06-27T00:00:00Z',
      },
    ]);
    expect(content).toContain('CTID Index');
    expect(content).toContain('ctid_ags_1_aabbccdd');
  });

  it('generates version page', () => {
    const content = gen.generateVersionPage({
      version: '0.1.0',
      date: '2026-06-27',
      description: 'First release',
      highlights: ['CLI works'],
      ctids: ['ctid_ags_1_aabbccdd'],
      breakingChanges: [],
    });
    expect(content).toContain('Version 0.1.0');
    expect(content).toContain('CLI works');
  });

  it('writes files locally in dry-run', () => {
    const g = new WikiGenerator({
      owner: 'suissa',
      repo: 'ags',
      version: '0.1.0',
      dryRun: true,
      cwd: TMP,
    });
    g.generateHome('Test', 'Description');
    expect(existsSync(join(TMP, 'docs/wiki/Home.md'))).toBe(true);
  });
});

describe('Changelog helpers', () => {
  it('generates changelog markdown', () => {
    const md = generateChangelog([{ version: '1.0.0', date: '2026-01-01', changes: ['Release'], ctids: [] }]);
    expect(md).toContain('# Changelog');
    expect(md).toContain('1.0.0');
  });

  it('generates CTID index', () => {
    const md = generateCTIDIndex([{
      ctid: 'ctid_r_1_aabb1234',
      repoSlug: 'r',
      issueNumber: 1,
      shortHash: 'aabb1234',
      status: 'converged',
      createdAt: '',
      updatedAt: '',
    }]);
    expect(md).toContain('converged');
    expect(md).toContain('ctid_r_1_aabb1234');
  });
});
