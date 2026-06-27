import { SyncRule, RuleActionConfig, RuleExecutionContext, RuleExecutionResult } from './rule-types.js';

export class RuleExecutor {
  async execute(rule: SyncRule, ctx: RuleExecutionContext): Promise<RuleExecutionResult> {
    const actionsExecuted: string[] = [];

    try {
      for (const action of rule.actions) {
        await this.executeAction(action, ctx);
        actionsExecuted.push(action.type);
      }

      return { ruleId: rule.id, actionsExecuted, success: true };
    } catch (err) {
      return {
        ruleId: rule.id,
        actionsExecuted,
        success: false,
        error: (err as Error).message,
      };
    }
  }

  private async executeAction(action: RuleActionConfig, ctx: RuleExecutionContext): Promise<void> {
    const { dryRun } = ctx.config;
    const label = `[rule-executor${dryRun ? ':dry-run' : ''}]`;

    switch (action.type) {
      case 'add_to_project':
        console.log(`${label} add_to_project: ${action.project} (ctid=${ctx.event.ctid ?? 'none'})`);
        break;

      case 'move_project_item':
        console.log(`${label} move_project_item: ${action.project} -> ${action.status}`);
        break;

      case 'set_field':
        console.log(`${label} set_field: ${action.field}=${action.value}`);
        break;

      case 'create_issue_comment':
        console.log(`${label} create_issue_comment: "${action.comment}"`);
        break;

      case 'create_bug_issue':
        console.log(`${label} create_bug_issue for event: ${ctx.event.type}`);
        break;

      case 'create_security_issue':
        console.log(`${label} create_security_issue for event: ${ctx.event.type}`);
        break;

      case 'attach_ctid':
        console.log(`${label} attach_ctid: ${ctx.event.ctid ?? 'generate new'}`);
        break;

      case 'write_trace':
        console.log(`${label} write_trace: ${JSON.stringify({ event: ctx.event.type, ctid: ctx.event.ctid })}`);
        break;

      default:
        console.warn(`${label} unknown action type: ${(action as RuleActionConfig).type}`);
    }
  }
}
