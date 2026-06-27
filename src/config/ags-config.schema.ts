import { z } from 'zod';

export const AGSModeSchema = z.enum(['simple', 'allascode']);
export type AGSMode = z.infer<typeof AGSModeSchema>;

export const AGSConfigSchema = z.object({
  name: z.string().min(1),
  owner: z.string().min(1),
  repo: z.string().min(1),
  mode: AGSModeSchema,
  tasksGenerated: z.boolean().default(false),
  tasksPath: z.string().optional(),
  tui: z.boolean().default(false),
  dryRun: z.boolean().default(false),
  wiki: z.boolean().default(false),
  createdAt: z.string().datetime(),
  version: z.string().default('0.1.0'),
});

export type AGSConfig = z.infer<typeof AGSConfigSchema>;
