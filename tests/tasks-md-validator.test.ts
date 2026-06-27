import { validateTasksMDContent } from '../src/tasks/tasks-md-validator.js';

const VALID_CONTENT = `# Tasks

> AGS directive: run all tasks

- [ ] 🚀 #1 - Implement feature A
  - [ ] Subtask 1
  - [ ] Subtask 2
- [ ] 🚀 TASK-002 - Fix bug B
`;

const NO_TASKS = `# Tasks\n\nNo tasks here.\n`;

const MISSING_ID = `- [ ] 🚀 No ID here\n`;

const BAD_INDENT = `- [ ] 🚀 #3 - Task
 - [ ] barely indented subtask (1 space)
`;

describe('validateTasksMDContent', () => {
  it('validates valid content', () => {
    const report = validateTasksMDContent(VALID_CONTENT);
    expect(report.valid).toBe(true);
    expect(report.taskCount).toBe(2);
    expect(report.issues.filter(i => i.severity === 'error')).toHaveLength(0);
  });

  it('detects no tasks', () => {
    const report = validateTasksMDContent(NO_TASKS);
    expect(report.valid).toBe(false);
    expect(report.issues.some(i => i.message.includes('No tasks'))).toBe(true);
  });

  it('detects missing task ID', () => {
    const report = validateTasksMDContent(MISSING_ID);
    const errors = report.issues.filter(i => i.severity === 'error');
    expect(errors.some(i => i.message.includes('missing ID'))).toBe(true);
  });

  it('detects badly indented subtask', () => {
    const report = validateTasksMDContent(BAD_INDENT);
    const warnings = report.issues.filter(i => i.severity === 'warning');
    expect(warnings.some(i => i.message.includes('indentation'))).toBe(true);
  });

  it('reports checked count', () => {
    const content = `- [x] 🚀 #1 - Done task\n- [ ] 🚀 #2 - Open task\n`;
    const report = validateTasksMDContent(content);
    expect(report.checkedCount).toBe(1);
    expect(report.taskCount).toBe(2);
  });
});
