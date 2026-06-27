export interface SemanticTrace {
  step: string;
  decision: string;
  evidence?: string;
  timestamp: string;
}

export interface ProvenanceReport {
  ctid: string;
  taskId: string;
  issueNumber?: number;
  branch?: string;
  prNumber?: number;
  agents: string[];
  models: string[];
  artifacts: string[];
  testsRun: string[];
  semanticTraces: SemanticTrace[];
  risks: string[];
  estimatedCostUSD?: number;
  totalTimeMs?: number;
  finalContext?: string;
  generatedAt: string;
  version: string;
}
