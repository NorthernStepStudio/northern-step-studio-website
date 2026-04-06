/**
 * 🛰️ EventTracker (Mobile)
 * 
 * Tracks user interactions and system events for AI context.
 * Matches the interface of the NSS Workspace AI tracker.
 */

export interface NssEvent {
  type: string;
  timestamp: string;
  metadata: Record<string, any>;
}

export class EventTracker {
  private static instance: EventTracker;
  private events: NssEvent[] = [];
  private readonly MAX_EVENTS = 50;

  private constructor() {}

  public static getInstance(): EventTracker {
    if (!EventTracker.instance) {
      EventTracker.instance = new EventTracker();
    }
    return EventTracker.instance;
  }

  /**
   * Track an event
   * @param type - Event type (e.g., 'feature_used', 'mode_switched')
   * @param metadata - Additional data for context
   */
  public track(type: string, metadata: Record<string, any> = {}): void {
    const event: NssEvent = {
      type,
      timestamp: new Date().toISOString(),
      metadata,
    };

    // Add to start (newest first)
    this.events.unshift(event);
    
    // Maintain limit
    if (this.events.length > this.MAX_EVENTS) {
      this.events.pop();
    }
    
    // Optional: Log in dev mode
    if (__DEV__) {
      console.log(`[EventTracker] ⚡ ${type}`, metadata);
    }
  }

  /**
   * Get all tracked events
   */
  public getEvents(): readonly NssEvent[] {
    return this.events;
  }

  /**
   * Clear all events
   */
  public clear(): void {
    this.events = [];
  }
}

export const eventTracker = EventTracker.getInstance();
