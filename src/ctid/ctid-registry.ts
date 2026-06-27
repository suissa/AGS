import { CTIDRecord, CTIDStatus } from './ctid-types.js';
import { CTIDStore } from './ctid-store.js';
import { generateCTID, updateCTIDStatus } from './ctid.js';

export class CTIDRegistry {
  private store: CTIDStore;
  private repoSlug: string;

  constructor(repoSlug: string, registryPath?: string) {
    this.repoSlug = repoSlug;
    this.store = new CTIDStore(registryPath);
  }

  async load(): Promise<void> {
    this.store.load();
  }

  async save(): Promise<void> {
    this.store.save();
  }

  create(issueNumber: number): CTIDRecord {
    const record = generateCTID(this.repoSlug, issueNumber);
    this.store.set(record);
    return record;
  }

  get(ctid: string): CTIDRecord | undefined {
    return this.store.get(ctid);
  }

  getAll(): CTIDRecord[] {
    return this.store.getAll();
  }

  updateStatus(ctid: string, status: CTIDStatus): CTIDRecord | undefined {
    const existing = this.store.get(ctid);
    if (!existing) return undefined;
    const updated = updateCTIDStatus(existing, status);
    this.store.set(updated);
    return updated;
  }

  findByIssue(issueNumber: number): CTIDRecord | undefined {
    return this.store.getAll().find(r => r.issueNumber === issueNumber);
  }

  hasCollision(ctid: string): boolean {
    return this.store.has(ctid);
  }
}
