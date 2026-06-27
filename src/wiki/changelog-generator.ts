import { CTIDRecord } from '../ctid/ctid-types.js';

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
  ctids: string[];
}

export function generateChangelog(entries: ChangelogEntry[]): string {
  const lines: string[] = ['# Changelog', ''];

  for (const entry of entries) {
    lines.push(`## ${entry.version} — ${entry.date}`);

    if (entry.ctids.length > 0) {
      lines.push(`\nCTIDs: ${entry.ctids.map(c => `\`${c}\``).join(', ')}`);
    }

    lines.push('');
    for (const change of entry.changes) {
      lines.push(`- ${change}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

export function generateCTIDIndex(records: CTIDRecord[]): string {
  const lines: string[] = ['# CTID Index', ''];

  const grouped = new Map<string, CTIDRecord[]>();
  for (const record of records) {
    const list = grouped.get(record.status) ?? [];
    list.push(record);
    grouped.set(record.status, list);
  }

  for (const [status, recs] of grouped.entries()) {
    lines.push(`## ${status}`);
    for (const r of recs) {
      lines.push(`- \`${r.ctid}\` — Issue #${r.issueNumber}${r.branch ? ` | Branch: \`${r.branch}\`` : ''}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
