import { TimelineEvent, timelineService } from "@/lib/studioos/timeline-service";
import { formatDateTime } from "@/lib/dashboard/format";

export interface TimelineViewModel {
  events: Array<{
    id: string;
    title: string;
    message: string;
    at: string;
    type: string;
    severityTone: "danger" | "warning" | "accent";
    appLabel: string;
  }>;
}

export function buildTimelineViewModel(events: TimelineEvent[]): TimelineViewModel {
  return {
    events: events.map(ev => ({
      id: ev.id,
      title: ev.title,
      message: ev.message,
      at: formatDateTime(ev.timestamp),
      type: ev.type.toUpperCase(),
      severityTone: ev.severity === "critical" || ev.severity === "high" ? "danger" : ev.severity === "medium" ? "warning" : "accent",
      appLabel: ev.appId?.toUpperCase() || "SYSTEM"
    }))
  };
}

export async function loadTimelineViewModel(): Promise<TimelineViewModel> {
  const events = await timelineService.getTimeline();
  return buildTimelineViewModel(events);
}
