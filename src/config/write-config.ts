import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { AGSConfig } from './ags-config.schema.js';
import { CONFIG_PATH } from './load-config.js';

export function writeConfig(config: AGSConfig, cwd: string = process.cwd()): void {
  const configPath = resolve(cwd, CONFIG_PATH);
  const configDir = dirname(configPath);

  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }

  writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
}
