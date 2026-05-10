import Link from "next/link";

import { DashboardApiError } from "@/lib/dashboard/api";
import { DashboardEmptyState } from "./empty-state";
import { DashboardPageHeader } from "./page-header";

function formatErrorDetail(error: unknown): string {
  if (error instanceof DashboardApiError) {
    return error.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "The control surface could not load data from the backend.";
}

export function DashboardBackendUnavailable({
  area,
  error,
}: {
  readonly area: string;
  readonly error: unknown;
}) {
  return (
    <>
      <DashboardPageHeader
        eyebrow="NStepOS dashboard"
        title={`${area} unavailable`}
        subtitle="The dashboard reached the app shell, but backend data is currently unavailable."
      />
      <DashboardEmptyState
        title="Backend connection failed"
        message={formatErrorDetail(error)}
        action={
          <>
            <Link className="button button-primary" href="/dashboard">
              Retry
            </Link>
            <Link className="button button-secondary" href="/dashboard/settings">
              Open settings
            </Link>
          </>
        }
      />
    </>
  );
}
