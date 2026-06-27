import { LLMPluginLayer } from '../llm/llm-plugin-layer.js';
import { ValidationReport } from './tasks-types.js';

export class TasksAIValidator {
  private llm: LLMPluginLayer;

  constructor(llm?: LLMPluginLayer) {
    this.llm = llm ?? new LLMPluginLayer('mock');
  }

  async enhance(report: ValidationReport, content: string): Promise<ValidationReport> {
    if (!report.valid) return report;

    const result = await this.llm.validateTasksMD(content);

    const aiIssues = result.issues.map(msg => ({
      line: 0,
      message: `[AI] ${msg}`,
      severity: 'warning' as const,
    }));

    return {
      ...report,
      issues: [...report.issues, ...aiIssues],
      valid: result.valid && report.valid,
    };
  }
}
