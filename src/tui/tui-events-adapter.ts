import { EventBus } from '../events/event-bus.js';
import { TUIState, applyEventToState } from './tui-state.js';
import { AGSEvent } from '../events/event-types.js';

export class TUIEventsAdapter {
  private state: TUIState;
  private onStateChange: (state: TUIState) => void;

  constructor(initialState: TUIState, onStateChange: (state: TUIState) => void) {
    this.state = initialState;
    this.onStateChange = onStateChange;
  }

  attach(bus: EventBus): void {
    bus.subscribe('*', (event: AGSEvent) => {
      this.state = applyEventToState(this.state, event);
      this.onStateChange(this.state);
    });
  }

  getState(): TUIState {
    return this.state;
  }
}
