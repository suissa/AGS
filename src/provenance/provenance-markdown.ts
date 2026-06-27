import { ProvenanceReport } from './provenance-schema.js';

export function generateProvenanceMarkdown(report: ProvenanceReport): string {
  const lines: string[] = [];

  lines.push(`# Cognitive Provenance Report`);
  lines.push(`\n**CTID:** \`${report.ctid}\``);
  lines.push(`**Task:** ${report.taskId}`);
  if (report.issueNumber) lines.push(`**Issue:** #${report.issueNumber}`);
  if (report.branch) lines.push(`**Branch:** \`${report.branch}\``);
  if (report.prNumber) lines.push(`**PR:** #${report.prNumber}`);
  lines.push(`**Generated:** ${report.generatedAt}`);
  lines.push(`**Version:** ${report.version}`);

  lines.push(`\n## Agents & Models`);
  if (report.agents.length > 0) {
    lines.push(`**Agents:** ${report.agents.join(', ')}`);
  }
  if (report.models.length > 0) {
    lines.push(`**Models:** ${report.models.join(', ')}`);
  }

  if (report.artifacts.length > 0) {
    lines.push(`\n## Artifacts`);
    for (const artifact of report.artifacts) {
      lines.push(`- ${artifact}`);
    }
  }

  if (report.testsRun.length > 0) {
    lines.push(`\n## Tests`);
    for (const test of report.testsRun) {
      lines.push(`- ${test}`);
    }
  }

  if (report.semanticTraces.length > 0) {
    lines.push(`\n## Semantic Traces`);
    for (const trace of report.semanticTraces) {
      lines.push(`\n### ${trace.step}`);
      lines.push(`**Decision:** ${trace.decision}`);
      if (trace.evidence) lines.push(`**Evidence:** ${trace.evidence}`);
      lines.push(`*${trace.timestamp}*`);
    }
  }

  if (report.risks.length > 0) {
    lines.push(`\n## Risks`);
    for (const risk of report.risks) {
      lines.push(`- ⚠️ ${risk}`);
    }
  }

  lines.push(`\n## Metrics`);
  if (report.estimatedCostUSD !== undefined) {
    lines.push(`**Estimated Cost:** $${report.estimatedCostUSD.toFixed(4)}`);
  }
  if (report.totalTimeMs !== undefined) {
    lines.push(`**Total Time:** ${(report.totalTimeMs / 1000).toFixed(1)}s`);
  }

  if (report.finalContext) {
    lines.push(`\n## Final Context Summary`);
    lines.push(report.finalContext);
  }

  return lines.join('\n');
}
