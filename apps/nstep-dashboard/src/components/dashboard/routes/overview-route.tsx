import { LockedExecutiveOverview } from "@/ui-lock/cards/executive-overview";
import { DashboardOverviewViewModel } from "@/lib/dashboard/view-models/overview-view-model";

export function DashboardOverviewRoute({
  view,
}: {
  readonly view: DashboardOverviewViewModel;
}) {
  return <LockedExecutiveOverview view={view} />;
}
