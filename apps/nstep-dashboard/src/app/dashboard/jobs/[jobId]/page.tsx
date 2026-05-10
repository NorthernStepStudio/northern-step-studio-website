import { notFound } from "next/navigation";

import { assertDashboardAccess, readDashboardSessionFromCookies } from "@/lib/auth";
import { DashboardApiError, getDashboardJob } from "@/lib/dashboard/api";
import { DashboardJobDetailRoute } from "@/components/dashboard/routes/job-detail-route";
import { DashboardBackendUnavailable } from "@/components/dashboard/backend-unavailable";

export const dynamic = "force-dynamic";

export default async function JobDetailPage({
  params,
}: {
  readonly params: Promise<{ readonly jobId: string }> | { readonly jobId: string };
}) {
  const { jobId } = await Promise.resolve(params);
  assertDashboardAccess(await readDashboardSessionFromCookies(), `/dashboard/jobs/${jobId}`);

  let job;
  try {
    job = await getDashboardJob(jobId);
  } catch (error) {
    if (error instanceof DashboardApiError && error.status === 404) {
      notFound();
    }
    return <DashboardBackendUnavailable area="Job detail" error={error} />;
  }

  return <DashboardJobDetailRoute job={job} />;
}
