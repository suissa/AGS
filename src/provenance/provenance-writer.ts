import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { ProvenanceReport } from './provenance-schema.js';
import { generateProvenanceMarkdown } from './provenance-markdown.js';

export class ProvenanceWriter {
  private cwd: string;

  constructor(cwd: string = process.cwd()) {
    this.cwd = cwd;
  }

  writeJSON(report: ProvenanceReport): string {
    const dir = resolve(this.cwd, '.ags/provenance');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    const path = resolve(dir, `${report.ctid}.json`);
    writeFileSync(path, JSON.stringify(report, null, 2), 'utf-8');
    return path;
  }

  writeMarkdown(report: ProvenanceReport): string {
    const dir = resolve(this.cwd, 'docs/lifecycle/provenance');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    const path = resolve(dir, `${report.ctid}.md`);
    writeFileSync(path, generateProvenanceMarkdown(report), 'utf-8');
    return path;
  }

  write(report: ProvenanceReport): { jsonPath: string; mdPath: string } {
    return {
      jsonPath: this.writeJSON(report),
      mdPath: this.writeMarkdown(report),
    };
  }
}
