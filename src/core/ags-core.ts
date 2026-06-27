import { AGSConfig } from '../config/ags-config.schema.js';
import { EventBus } from '../events/event-bus.js';
import { CTIDRegistry } from '../ctid/ctid-registry.js';

export interface AGSCoreContext {
  config: AGSConfig;
  eventBus: EventBus;
  ctidRegistry: CTIDRegistry;
  dryRun: boolean;
}

export class AGSCore {
  private context: AGSCoreContext;

  constructor(config: AGSConfig) {
    this.context = {
      config,
      eventBus: new EventBus(),
      ctidRegistry: new CTIDRegistry(config.repo),
      dryRun: config.dryRun,
    };
  }

  get ctx(): AGSCoreContext {
    return this.context;
  }

  async initialize(): Promise<void> {
    await this.context.ctidRegistry.load();
  }

  async shutdown(): Promise<void> {
    await this.context.ctidRegistry.save();
    this.context.eventBus.removeAllListeners();
  }
}
