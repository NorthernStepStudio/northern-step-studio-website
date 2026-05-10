import type { DashboardMetric, DashboardSettingsResponse } from "@/lib/dashboard/contracts";

export function buildDashboardSettingsMetrics(settings: DashboardSettingsResponse): readonly DashboardMetric[] {
  return [
    {
      label: "Tenant rules",
      value: settings.summary.tenantRuleCount,
      detail: "Scoped rule sets per product.",
      tone: "accent",
    },
    {
      label: "Templates",
      value: settings.summary.communicationTemplateCount,
      detail: "Reusable communication copy.",
      tone: "success",
    },
    {
      label: "Suppression rules",
      value: settings.summary.suppressionRuleCount,
      detail: "Safety boundaries and timing rules.",
      tone: "warning",
    },
    {
      label: "Editable memory",
      value: settings.summary.editableMemoryCount,
      detail: "Memory entries operators can update.",
      tone: "accent",
    },
    {
      label: "Audit entries",
      value: settings.summary.recentAuditEntries,
      detail: "Recent memory changes and notes.",
      tone: "danger",
    },
  ];
}

