import { randomBytes } from 'crypto';
import { CTIDRecord, CTIDStatus } from './ctid-types.js';

export function generateCTID(repoSlug: string, issueNumber: number): CTIDRecord {
  const slug = repoSlug.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const shortHash = randomBytes(4).toString('hex');
  const ctid = `ctid_${slug}_${issueNumber}_${shortHash}`;
  const now = new Date().toISOString();

  return {
    ctid,
    repoSlug: slug,
    issueNumber,
    shortHash,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };
}

export function updateCTIDStatus(record: CTIDRecord, status: CTIDStatus): CTIDRecord {
  return {
    ...record,
    status,
    updatedAt: new Date().toISOString(),
  };
}

export function parseCTID(ctid: string): { repoSlug: string; issueNumber: number; shortHash: string } | null {
  const match = ctid.match(/^ctid_(.+)_(\d+)_([a-f0-9]{8})$/);
  if (!match) return null;
  return {
    repoSlug: match[1],
    issueNumber: parseInt(match[2], 10),
    shortHash: match[3],
  };
}
