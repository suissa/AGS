export interface ParsedTask {
  id: string;
  title: string;
  checked: boolean;
  line: number;
  subtasks: ParsedSubtask[];
}

export interface ParsedSubtask {
  description: string;
  checked: boolean;
  line: number;
  indentLevel: number;
}

export interface ParsedTaskFile {
  tasks: ParsedTask[];
  rawLines: string[];
  hasDirective: boolean;
}

export interface ValidationIssue {
  line: number;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationReport {
  valid: boolean;
  issues: ValidationIssue[];
  taskCount: number;
  checkedCount: number;
  filePath: string;
}
