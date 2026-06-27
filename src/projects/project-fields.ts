export interface ProjectField {
  name: string;
  dataType: 'TEXT' | 'NUMBER' | 'DATE' | 'SINGLE_SELECT' | 'ITERATION';
  options?: string[];
}

export const COMMON_FIELDS: ProjectField[] = [
  { name: 'CTID', dataType: 'TEXT' },
  { name: 'Status', dataType: 'SINGLE_SELECT', options: ['Backlog', 'Ready', 'In Progress', 'In Review', 'Blocked', 'Done', 'Failed'] },
  { name: 'Priority', dataType: 'SINGLE_SELECT', options: ['Critical', 'High', 'Medium', 'Low'] },
  { name: 'Task Type', dataType: 'SINGLE_SELECT', options: ['Feature', 'Bug', 'Chore', 'Security', 'Research'] },
  { name: 'Agent', dataType: 'TEXT' },
  { name: 'Last Sync', dataType: 'DATE' },
  { name: 'Source', dataType: 'TEXT' },
];

export const MINIMAL_FIELDS: ProjectField[] = [
  { name: 'Status', dataType: 'SINGLE_SELECT', options: ['Backlog', 'Ready', 'In Progress', 'In Review', 'Blocked', 'Done', 'Failed'] },
  { name: 'Priority', dataType: 'SINGLE_SELECT', options: ['Critical', 'High', 'Medium', 'Low'] },
  { name: 'CTID', dataType: 'TEXT' },
  { name: 'Task Type', dataType: 'SINGLE_SELECT', options: ['Feature', 'Bug', 'Chore', 'Security', 'Research'] },
];
