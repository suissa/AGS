#!/usr/bin/env node
import 'dotenv/config';
import { Command } from 'commander';
import { runProjectCreate } from './project-create.command.js';
import { runProjectSync } from './project-sync.command.js';

const program = new Command();

program
  .name('ags')
  .description('AGS — Agentic GitHub System')
  .version('0.1.0');

const projectCmd = program.command('project').description('Manage AGS projects');

projectCmd
  .command('create')
  .description('Create a new AGS project and provision GitHub Projects')
  .option('--name <name>', 'Project name')
  .option('--owner <owner>', 'GitHub owner (user or org)')
  .option('--repo <repo>', 'GitHub repository name')
  .option('--mode <mode>', 'Mode: simple | allascode', 'simple')
  .option('--tasks-generated', 'TASKS.md already generated', false)
  .option('--tasks-path <path>', 'Path to tasks .md file')
  .option('--tui', 'Enable TUI', false)
  .option('--wiki', 'Enable Wiki generation', false)
  .option('--dry-run', 'No real GitHub calls', false)
  .action(async (opts) => {
    try {
      await runProjectCreate({
        name: opts.name,
        owner: opts.owner,
        repo: opts.repo,
        mode: opts.mode,
        tasksGenerated: opts.tasksGenerated,
        tasksPath: opts.tasksPath,
        tui: opts.tui,
        wiki: opts.wiki,
        dryRun: opts.dryRun,
      });
    } catch (err) {
      console.error(`[ags] Error: ${(err as Error).message}`);
      process.exit(1);
    }
  });

projectCmd
  .command('sync')
  .description('Sync AGS project with GitHub state')
  .option('--dry-run', 'No real GitHub calls', false)
  .action(async (opts) => {
    try {
      await runProjectSync({ dryRun: opts.dryRun });
    } catch (err) {
      console.error(`[ags] Error: ${(err as Error).message}`);
      process.exit(1);
    }
  });

program.parse(process.argv);
