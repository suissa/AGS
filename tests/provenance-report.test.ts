import { ProvenanceReportBuilder } from '../src/provenance/provenance-report.js';
import { generateProvenanceMarkdown } from '../src/provenance/provenance-markdown.js';

describe('ProvenanceReport', () => {
  it('builds a valid report', () => {
    const report = new ProvenanceReportBuilder('ctid_repo_1_abc12345', 'task-1')
      .setIssue(1)
      .setBranch('feature/test')
      .addAgent('builder-a')
      .addModel('claude-sonnet-4-6')
      .addArtifact('src/feature.ts')
      .addTest('unit: feature.test.ts')
      .addTrace({ step: 'Planning', decision: 'Use TDD approach', evidence: 'team convention' })
      .addRisk('API rate limit may be hit')
      .setCost(0.05)
      .setFinalContext('Feature implemented and tested.')
      .build();

    expect(report.ctid).toBe('ctid_repo_1_abc12345');
    expect(report.taskId).toBe('task-1');
    expect(report.agents).toContain('builder-a');
    expect(report.models).toContain('claude-sonnet-4-6');
    expect(report.semanticTraces).toHaveLength(1);
    expect(report.risks).toHaveLength(1);
    expect(report.estimatedCostUSD).toBe(0.05);
    expect(report.totalTimeMs).toBeGreaterThanOrEqual(0);
    expect(report.generatedAt).toBeTruthy();
    expect(report.version).toBeTruthy();
  });

  it('generates valid Markdown', () => {
    const report = new ProvenanceReportBuilder('ctid_repo_2_aabbccdd', 'task-2')
      .addAgent('builder-a')
      .build();

    const md = generateProvenanceMarkdown(report);
    expect(md).toContain('# Cognitive Provenance Report');
    expect(md).toContain('ctid_repo_2_aabbccdd');
    expect(md).toContain('builder-a');
  });

  it('does not include raw chain-of-thought', () => {
    const report = new ProvenanceReportBuilder('ctid_test_1_deadbeef', 'task-cot-test')
      .addTrace({ step: 'Analysis', decision: 'Summary only', evidence: 'No CoT included' })
      .build();

    const md = generateProvenanceMarkdown(report);
    expect(md).not.toContain('chain-of-thought');
    expect(md).toContain('Analysis');
  });
});
