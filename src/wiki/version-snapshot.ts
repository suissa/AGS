export interface VersionSnapshot {
  version: string;
  date: string;
  description: string;
  highlights: string[];
  ctids: string[];
  breakingChanges: string[];
}

export function generateVersionPage(snapshot: VersionSnapshot): string {
  const lines: string[] = [];

  lines.push(`# Version ${snapshot.version}`);
  lines.push(`**Released:** ${snapshot.date}`);
  lines.push('');
  lines.push(snapshot.description);

  if (snapshot.highlights.length > 0) {
    lines.push('\n## Highlights');
    for (const h of snapshot.highlights) {
      lines.push(`- ${h}`);
    }
  }

  if (snapshot.breakingChanges.length > 0) {
    lines.push('\n## Breaking Changes');
    for (const bc of snapshot.breakingChanges) {
      lines.push(`- ⚠️ ${bc}`);
    }
  }

  if (snapshot.ctids.length > 0) {
    lines.push('\n## CTIDs');
    for (const ctid of snapshot.ctids) {
      lines.push(`- \`${ctid}\``);
    }
  }

  return lines.join('\n');
}
