import { ProvenanceReport, SemanticTrace } from './provenance-schema.js';
import { ProvenanceWriter } from './provenance-writer.js';

export class ProvenanceReportBuilder {
  private report: Partial<ProvenanceReport>;
  private startTime: number;

  constructor(ctid: string, taskId: string) {
    this.startTime = Date.now();
    this.report = {
      ctid,
      taskId,
      agents: [],
      models: [],
      artifacts: [],
      testsRun: [],
      semanticTraces: [],
      risks: [],
      version: '0.1.0',
    };
  }

  setIssue(issueNumber: number): this {
    this.report.issueNumber = issueNumber;
    return this;
  }

  setBranch(branch: string): this {
    this.report.branch = branch;
    return this;
  }

  setPR(prNumber: number): this {
    this.report.prNumber = prNumber;
    return this;
  }

  addAgent(name: string): this {
    this.report.agents!.push(name);
    return this;
  }

  addModel(model: string): this {
    if (!this.report.models!.includes(model)) {
      this.report.models!.push(model);
    }
    return this;
  }

  addArtifact(path: string): this {
    this.report.artifacts!.push(path);
    return this;
  }

  addTest(testName: string): this {
    this.report.testsRun!.push(testName);
    return this;
  }

  addTrace(trace: Omit<SemanticTrace, 'timestamp'>): this {
    this.report.semanticTraces!.push({
      ...trace,
      timestamp: new Date().toISOString(),
    });
    return this;
  }

  addRisk(risk: string): this {
    this.report.risks!.push(risk);
    return this;
  }

  setFinalContext(context: string): this {
    this.report.finalContext = context;
    return this;
  }

  setCost(costUSD: number): this {
    this.report.estimatedCostUSD = costUSD;
    return this;
  }

  build(): ProvenanceReport {
    return {
      ...(this.report as Required<Omit<ProvenanceReport, 'estimatedCostUSD' | 'totalTimeMs' | 'finalContext' | 'issueNumber' | 'branch' | 'prNumber'>>),
      ...this.report,
      totalTimeMs: Date.now() - this.startTime,
      generatedAt: new Date().toISOString(),
    } as ProvenanceReport;
  }

  buildAndWrite(cwd?: string): ProvenanceReport {
    const report = this.build();
    const writer = new ProvenanceWriter(cwd);
    writer.write(report);
    return report;
  }
}
