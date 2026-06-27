import { appendFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { AGSEvent } from './event-types.js';

export class EventLogWriter {
  private logPath: string;
  private enabled: boolean;

  constructor(logPath?: string) {
    this.logPath = logPath ?? resolve(process.cwd(), '.ags/events.jsonl');
    this.enabled = true;
  }

  write(event: AGSEvent): void {
    if (!this.enabled) return;

    try {
      const dir = dirname(this.logPath);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      appendFileSync(this.logPath, JSON.stringify(event) + '\n', 'utf-8');
    } catch {
      // Non-fatal: log write failure should not crash the runtime
    }
  }

  disable(): void {
    this.enabled = false;
  }

  enable(): void {
    this.enabled = true;
  }
}
