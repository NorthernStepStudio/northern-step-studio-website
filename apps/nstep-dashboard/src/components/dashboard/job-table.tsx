import Link from "next/link";

import type { DashboardJobListItem } from "@/lib/dashboard/contracts";
import { formatDateTime, formatStatusLabel, productTitle } from "@/lib/dashboard/format";
import { DashboardStatusPill } from "./status-pill";

export function DashboardJobTable({
  items,
  compact = false,
}: {
  readonly items: readonly DashboardJobListItem[];
  readonly compact?: boolean;
}) {
  if (items.length === 0) {
    return <div className="empty-state">No jobs are available yet.</div>;
  }

  return (
    <div className="table-wrap">
      <table className="table nsos-table">
        <thead>
          <tr>
            <th>Job</th>
            <th>Product</th>
            <th>Status</th>
            <th>Approval</th>
            <th>Updated</th>
            <th>Open</th>
          </tr>
        </thead>
        <tbody>
          {items.map((job) => (
            <tr key={job.jobId}>
              <td>
                <Link className="nsos-table-link" href={`/dashboard/jobs/${encodeURIComponent(job.jobId)}`}>
                  <span className="nsos-table-primary">{job.goal}</span>
                  <span className="nsos-table-secondary">{job.workflow}</span>
                </Link>
              </td>
              <td>
                <span className="nsos-table-primary">{productTitle(job.product)}</span>
                <span className="nsos-table-secondary">{job.lane}</span>
              </td>
              <td>
                <DashboardStatusPill value={job.status} label={formatStatusLabel(job.status)} />
              </td>
              <td>
                <DashboardStatusPill value={job.approvalStatus} />
              </td>
              <td>{compact ? formatDateTime(job.updatedAt) : formatDateTime(job.updatedAt)}</td>
              <td>
                <Link className="button button-secondary" href={`/dashboard/jobs/${encodeURIComponent(job.jobId)}`}>
                  Open job
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
