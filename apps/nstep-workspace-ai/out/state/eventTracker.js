"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventTracker = exports.EventTracker = void 0;
class EventTracker {
    static instance;
    events = [];
    MAX_EVENTS = 50;
    constructor() { }
    static getInstance() {
        if (!EventTracker.instance) {
            EventTracker.instance = new EventTracker();
        }
        return EventTracker.instance;
    }
    track(type, metadata = {}) {
        const event = {
            type,
            timestamp: new Date().toISOString(),
            metadata,
        };
        this.events.unshift(event);
        if (this.events.length > this.MAX_EVENTS) {
            this.events.pop();
        }
        console.log(`[EventTracker] Tracked: ${type}`, metadata);
    }
    getEvents() {
        return this.events;
    }
    clear() {
        this.events = [];
    }
}
exports.EventTracker = EventTracker;
exports.eventTracker = EventTracker.getInstance();
//# sourceMappingURL=eventTracker.js.map