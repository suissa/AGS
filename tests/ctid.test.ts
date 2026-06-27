import { generateCTID, parseCTID, updateCTIDStatus } from '../src/ctid/ctid.js';
import { CTIDRegistry } from '../src/ctid/ctid-registry.js';
import { tmpdir } from 'os';
import { join } from 'path';
import { rmSync, existsSync } from 'fs';

describe('CTID generation', () => {
  it('generates a valid CTID', () => {
    const record = generateCTID('my_repo', 42);
    expect(record.ctid).toMatch(/^ctid_my_repo_42_[a-f0-9]{8}$/);
    expect(record.repoSlug).toBe('my_repo');
    expect(record.issueNumber).toBe(42);
    expect(record.status).toBe('pending');
  });

  it('sanitizes repo slug', () => {
    const record = generateCTID('My-Repo/Service', 1);
    expect(record.ctid).toMatch(/^ctid_my_repo_service_1_[a-f0-9]{8}$/);
  });

  it('generates unique CTIDs on repeated calls', () => {
    const a = generateCTID('repo', 1);
    const b = generateCTID('repo', 1);
    expect(a.ctid).not.toBe(b.ctid);
  });

  it('parses a valid CTID', () => {
    const record = generateCTID('auth_service', 42);
    const parsed = parseCTID(record.ctid);
    expect(parsed).not.toBeNull();
    expect(parsed!.issueNumber).toBe(42);
    expect(parsed!.repoSlug).toBe('auth_service');
  });

  it('returns null for invalid CTID', () => {
    expect(parseCTID('invalid')).toBeNull();
    expect(parseCTID('ctid_no_hash')).toBeNull();
  });

  it('updates status', () => {
    const record = generateCTID('repo', 1);
    const updated = updateCTIDStatus(record, 'in_progress');
    expect(updated.status).toBe('in_progress');
    expect(updated.updatedAt).toBeTruthy();
    expect(typeof updated.updatedAt).toBe('string');
  });
});

describe('CTIDRegistry', () => {
  const tmpPath = join(tmpdir(), `ags-test-ctid-${Date.now()}.json`);

  afterEach(() => {
    if (existsSync(tmpPath)) rmSync(tmpPath);
  });

  it('creates and retrieves a CTID', async () => {
    const registry = new CTIDRegistry('my-repo', tmpPath);
    await registry.load();

    const record = registry.create(5);
    const retrieved = registry.get(record.ctid);

    expect(retrieved).toBeDefined();
    expect(retrieved!.issueNumber).toBe(5);
  });

  it('detects collision', async () => {
    const registry = new CTIDRegistry('repo', tmpPath);
    await registry.load();
    const record = registry.create(1);
    expect(registry.hasCollision(record.ctid)).toBe(true);
    expect(registry.hasCollision('nonexistent')).toBe(false);
  });

  it('persists and reloads registry', async () => {
    const r1 = new CTIDRegistry('repo', tmpPath);
    await r1.load();
    const record = r1.create(10);
    await r1.save();

    const r2 = new CTIDRegistry('repo', tmpPath);
    await r2.load();
    expect(r2.get(record.ctid)).toBeDefined();
  });

  it('updates status', async () => {
    const registry = new CTIDRegistry('repo', tmpPath);
    await registry.load();
    const record = registry.create(3);
    const updated = registry.updateStatus(record.ctid, 'converged');
    expect(updated!.status).toBe('converged');
  });

  it('finds by issue number', async () => {
    const registry = new CTIDRegistry('repo', tmpPath);
    await registry.load();
    registry.create(99);
    const found = registry.findByIssue(99);
    expect(found).toBeDefined();
    expect(found!.issueNumber).toBe(99);
  });
});
