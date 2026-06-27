import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { AGSConfig, AGSConfigSchema } from './ags-config.schema.js';

export const CONFIG_PATH = '.ags/config.json';

export function loadConfig(cwd: string = process.cwd()): AGSConfig {
  const configPath = resolve(cwd, CONFIG_PATH);

  if (!existsSync(configPath)) {
    throw new Error(
      `AGS config not found at ${configPath}. Run "ags project create" first.`
    );
  }

  const raw = readFileSync(configPath, 'utf-8');
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`AGS config at ${configPath} is not valid JSON.`);
  }

  const result = AGSConfigSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(
      `AGS config validation failed:\n${result.error.issues.map(i => `  - ${i.path.join('.')}: ${i.message}`).join('\n')}`
    );
  }

  return result.data;
}
