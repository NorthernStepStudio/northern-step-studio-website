import type { DashboardLogEntry } from "@/lib/dashboard/contracts";
import Link from "next/link";
import { formatDateTimeLong, formatStatusLabel } from "@/lib/dashboard/format";
import { DashboardStatusPill } from "./status-pill";

export function DashboardLogFeed({ items }: { readonly items: readonly DashboardLogEntry[] }) {
  if (items.length === 0) {
    return <div className="empty-state">Logs will appear here as jobs execute.</div>;
  }

  return (
    <div className="table-wrap">
      <table className="table nsos-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Level</th>
            <th>Actor</th>
            <th>Scope</th>
            <th>Message</th>
            <th>Job</th>
          </tr>
        </thead>
        <tbody>
          {items.map((log) => (
            <tr key={log.id}>
              <td>{formatDateTimeLong(log.at)}</td>
              <td>
                <DashboardStatusPill value={log.level} label={formatStatusLabel(log.level)} />
              </td>
              <td>
                <span className="nsos-table-primary">{formatStatusLabel(log.actorRole || "system")}</span>
                <span className="nsos-table-secondary">
                  {log.agentId ? `Agent ${log.agentId}` : log.source === "system" ? "system" : "workflow actor"}
                </span>
              </td>
              <td>
                <span className="nsos-table-primary">{log.source}</span>
                <span className="nsos-table-secondary">
                  {log.product ? `${log.product}` : "system"}
                  {log.stepId ? ` - ${log.stepId}` : ""}
                </span>
              </td>
              <td>
                <span className="nsos-table-primary">{log.message}</span>
                {log.data ? <span className="nsos-table-secondary">{JSON.stringify(log.data)}</span> : null}
              </td>
              <td>
                {log.jobId ? (
                  <Link className="nsos-table-link" href={`/dashboard/jobs/${encodeURIComponent(log.jobId)}`}>
                    <span className="nsos-table-primary">Open job</span>
                    <span className="nsos-table-secondary">{log.jobId}</span>
                  </Link>
                ) : (
                  <span className="nsos-table-secondary">system</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
