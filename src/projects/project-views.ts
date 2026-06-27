export interface ProjectView {
  name: string;
  layout: 'TABLE_LAYOUT' | 'BOARD_LAYOUT' | 'ROADMAP_LAYOUT';
}

export const DEFAULT_VIEWS: ProjectView[] = [
  { name: 'Board', layout: 'BOARD_LAYOUT' },
  { name: 'Table', layout: 'TABLE_LAYOUT' },
];
