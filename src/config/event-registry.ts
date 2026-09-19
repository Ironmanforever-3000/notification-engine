import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { EventTypeName, Tier, Channel, EventTypeConfig } from '../events/types';

// Zod schema to validate the configuration JSON
const EventTypeConfigSchema = z.object({
  event_type: z.custom<EventTypeName>((val) => typeof val === 'string'),
  tier: z.nativeEnum(Tier),
  default_channels: z.array(z.nativeEnum(Channel)),
  description: z.string(),
  bypass_dnd: z.boolean(),
  bypass_quiet_hours: z.boolean(),
  bypass_frequency_cap: z.boolean(),
  requires_optin: z.boolean(),
});

/**
 * Registry for managing event type configurations.
 */
export class EventRegistry {
  private events: Map<EventTypeName, EventTypeConfig> = new Map();

  constructor() {
    this.load();
  }

  /**
   * Loads and validates the event types from the JSON file.
   */
  private load(): void {
    try {
      // Goes up from src/config to the project root's config directory
      const configPath = path.resolve(__dirname, '../../config/event-types.json');
      if (!fs.existsSync(configPath)) {
        console.warn(`Event registry config not found at ${configPath}`);
        return;
      }

      const fileContent = fs.readFileSync(configPath, 'utf8');
      const rawEvents = JSON.parse(fileContent);

      if (!Array.isArray(rawEvents)) {
        throw new Error('Event types configuration must be an array');
      }

      for (const raw of rawEvents) {
        const validated = EventTypeConfigSchema.parse(raw);
        this.events.set(validated.event_type as EventTypeName, validated as EventTypeConfig);
      }
    } catch (error) {
      console.error('Failed to load event registry configuration:', error);
      throw error;
    }
  }

  /**
   * Retrieves config for a specific event type.
   */
  public get(eventType: EventTypeName): EventTypeConfig | undefined {
    return this.events.get(eventType);
  }

  /**
   * Gets all registered event configurations.
   */
  public getAll(): EventTypeConfig[] {
    return Array.from(this.events.values());
  }

  /**
   * Gets all event configurations for a specific tier.
   */
  public getByTier(tier: Tier): EventTypeConfig[] {
    return this.getAll().filter(config => config.tier === tier);
  }

  /**
   * Checks if an event type exists in the registry.
   */
  public exists(eventType: string): boolean {
    return this.events.has(eventType as EventTypeName);
  }

  /**
   * Checks if an event type is critical.
   */
  public isCritical(eventType: EventTypeName): boolean {
    const config = this.get(eventType);
    return config?.tier === Tier.CRITICAL;
  }

  /**
   * Checks if an event type requires user opt-in.
   */
  public requiresOptin(eventType: EventTypeName): boolean {
    const config = this.get(eventType);
    return config?.requires_optin ?? false;
  }

  /**
   * Gets the default channels for an event type.
   */
  public getDefaultChannels(eventType: EventTypeName): Channel[] {
    const config = this.get(eventType);
    return config?.default_channels ?? [];
  }
}

// Export singleton instance
export const eventRegistry = new EventRegistry();
