import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { CTIDRecord } from './ctid-types.js';

export const CTID_REGISTRY_PATH = '.ags/ctid-registry.json';

export class CTIDStore {
  private path: string;
  private records: Map<string, CTIDRecord>;

  constructor(registryPath?: string) {
    this.path = resolve(process.cwd(), registryPath ?? CTID_REGISTRY_PATH);
    this.records = new Map();
  }

  load(): void {
    if (!existsSync(this.path)) return;
    try {
      const raw = readFileSync(this.path, 'utf-8');
      const data = JSON.parse(raw) as Record<string, CTIDRecord>;
      this.records = new Map(Object.entries(data));
    } catch {
      this.records = new Map();
    }
  }

  save(): void {
    const dir = dirname(this.path);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const obj = Object.fromEntries(this.records.entries());
    writeFileSync(this.path, JSON.stringify(obj, null, 2), 'utf-8');
  }

  set(record: CTIDRecord): void {
    this.records.set(record.ctid, record);
  }

  get(ctid: string): CTIDRecord | undefined {
    return this.records.get(ctid);
  }

  getAll(): CTIDRecord[] {
    return Array.from(this.records.values());
  }

  has(ctid: string): boolean {
    return this.records.has(ctid);
  }

  delete(ctid: string): void {
    this.records.delete(ctid);
  }
}
