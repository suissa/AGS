import { ParsedTask, ParsedSubtask, ParsedTaskFile } from './tasks-types.js';

const TASK_PATTERN = /^(-\s+\[[ x]\]\s+)(🚀\s+)?(.+)/;
const SUBTASK_PATTERN = /^(\s+)-\s+\[[ x]\]\s+(.+)/;
const ID_PATTERN = /#\w+|TASK-\d+|\w+-\d+/;

export function parseTasksMD(content: string): ParsedTaskFile {
  const lines = content.split('\n');
  const tasks: ParsedTask[] = [];
  let hasDirective = false;
  let currentTask: ParsedTask | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    if (line.startsWith('>') && line.toLowerCase().includes('ags')) {
      hasDirective = true;
      continue;
    }

    const subtaskMatch = line.match(SUBTASK_PATTERN);
    if (subtaskMatch && currentTask) {
      const subtask: ParsedSubtask = {
        description: subtaskMatch[2].trim(),
        checked: line.includes('[x]'),
        line: lineNum,
        indentLevel: subtaskMatch[1].length,
      };
      currentTask.subtasks.push(subtask);
      continue;
    }

    const taskMatch = line.match(TASK_PATTERN);
    if (taskMatch) {
      const fullText = taskMatch[3].trim();
      const idMatch = fullText.match(ID_PATTERN);
      const id = idMatch ? idMatch[0] : '';

      currentTask = {
        id,
        title: fullText,
        checked: line.includes('[x]'),
        line: lineNum,
        subtasks: [],
      };
      tasks.push(currentTask);
    } else if (!line.match(/^\s+-\s+/)) {
      currentTask = null;
    }
  }

  return { tasks, rawLines: lines, hasDirective };
}
