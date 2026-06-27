import { EventBus } from '../events/event-bus.js';
import { TUIState, createInitialTUIState } from './tui-state.js';
import { TUIEventsAdapter } from './tui-events-adapter.js';
import { renderTUI } from './tui-renderer.js';

export class AGSTUI {
  private state: TUIState;
  private adapter: TUIEventsAdapter;
  private isTTY: boolean;
  private renderInterval?: ReturnType<typeof setInterval>;

  constructor(mode: string, repo: string) {
    this.state = createInitialTUIState(mode, repo);
    this.isTTY = Boolean(process.stdout.isTTY);
    this.adapter = new TUIEventsAdapter(this.state, (newState) => {
      this.state = newState;
      if (!this.renderInterval) this.render();
    });
  }

  attach(bus: EventBus): void {
    this.adapter.attach(bus);
  }

  start(intervalMs = 1000): void {
    if (!this.isTTY) {
      console.log('[TUI] Non-TTY environment detected. Falling back to log mode.');
      return;
    }
    this.render();
    this.renderInterval = setInterval(() => this.render(), intervalMs);
  }

  stop(): void {
    if (this.renderInterval) {
      clearInterval(this.renderInterval);
      this.renderInterval = undefined;
    }
  }

  render(): void {
    if (!this.isTTY) {
      return;
    }
    process.stdout.write('\x1B[2J\x1B[0f');
    process.stdout.write(renderTUI(this.state) + '\n');
  }

  getState(): TUIState {
    return this.state;
  }
}
