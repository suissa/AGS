import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { parseTasksMD } from './tasks-md-parser.js';
import { ValidationReport, ValidationIssue } from './tasks-types.js';

export function validateTasksMDFile(filePath: string, cwd: string = process.cwd()): ValidationReport {
  const absolutePath = resolve(cwd, filePath);

  if (!existsSync(absolutePath)) {
    return {
      valid: false,
      issues: [{ line: 0, message: `File not found: ${absolutePath}`, severity: 'error' }],
      taskCount: 0,
      checkedCount: 0,
      filePath: absolutePath,
    };
  }

  const content = readFileSync(absolutePath, 'utf-8');
  return validateTasksMDContent(content, absolutePath);
}

export function validateTasksMDContent(content: string, filePath = '<unknown>'): ValidationReport {
  const issues: ValidationIssue[] = [];
  const parsed = parseTasksMD(content);

  if (parsed.tasks.length === 0) {
    issues.push({
      line: 0,
      message: 'No tasks found. Expected format: "- [ ] 🚀 #ID - Task name"',
      severity: 'error',
    });
  }

  for (const task of parsed.tasks) {
    if (!task.id) {
      issues.push({
        line: task.line,
        message: `Task missing ID (e.g. #123 or TASK-001): "${task.title}"`,
        severity: 'error',
      });
    }

    for (const sub of task.subtasks) {
      if (sub.indentLevel < 2) {
        issues.push({
          line: sub.line,
          message: `Subtask has insufficient indentation (expected 2+ spaces): "${sub.description}"`,
          severity: 'warning',
        });
      }
    }
  }

  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.match(/^-\s+[^[]/)) {
      issues.push({
        line: i + 1,
        message: `List item missing checkbox "[ ]": "${line.trim()}"`,
        severity: 'warning',
      });
    }
  }

  const errorCount = issues.filter(i => i.severity === 'error').length;
  const checkedCount = parsed.tasks.filter(t => t.checked).length;

  return {
    valid: errorCount === 0,
    issues,
    taskCount: parsed.tasks.length,
    checkedCount,
    filePath,
  };
}

export function formatValidationReport(report: ValidationReport): string {
  const lines: string[] = [];
  lines.push(`## AGS Task Validation Report`);
  lines.push(`File: ${report.filePath}`);
  lines.push(`Tasks: ${report.taskCount} (${report.checkedCount} completed)`);
  lines.push(`Status: ${report.valid ? '✅ VALID' : '❌ INVALID'}`);

  if (report.issues.length > 0) {
    lines.push('\n### Issues');
    for (const issue of report.issues) {
      const icon = issue.severity === 'error' ? '❌' : '⚠️';
      lines.push(`${icon} Line ${issue.line}: ${issue.message}`);
    }
  }

  return lines.join('\n');
}
