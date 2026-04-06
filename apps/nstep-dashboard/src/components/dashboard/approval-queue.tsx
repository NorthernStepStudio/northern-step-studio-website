"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { approveDashboardApprovalItem, rejectDashboardApprovalItem } from "@/lib/dashboard/mutations";
import type { DashboardApprovalQueueItem } from "@/lib/dashboard/contracts";
import { formatDateTime, formatStatusLabel, productTitle } from "@/lib/dashboard/format";
import { DashboardEmptyState } from "./empty-state";
import { DashboardStatusPill } from "./status-pill";

type ApprovalAction = "approve" | "reject";

export function DashboardApprovalQueue({ items }: { readonly items: readonly DashboardApprovalQueueItem[] }) {
  const router = useRouter();
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const hasPendingAction = pendingKey !== null;

  async function runAction(item: DashboardApprovalQueueItem, action: ApprovalAction): Promise<void> {
    const key = queueKey(item);
    if (pendingKey) {
      return;
    }

    if (action === "reject" && typeof window !== "undefined") {
      const confirmed = window.confirm(
        `Reject ${item.stepTitle} for ${productTitle(item.product)}? This will stop the job.`,
      );
      if (!confirmed) {
        return;
      }
    }

    setPendingKey(key);
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });

    try {
      if (action === "approve") {
        await approveDashboardApprovalItem({ item });
      } else {
        await rejectDashboardApprovalItem({
          item,
          reason: `Rejected from dashboard: ${item.reason}`,
        });
      }
      router.refresh();
    } catch (error) {
      setErrors((current) => ({
        ...current,
        [key]: error instanceof Error ? error.message : String(error),
      }));
    } finally {
      setPendingKey(null);
    }
  }

  if (items.length === 0) {
    return <DashboardEmptyState title="No approvals waiting" message="Approved-safe jobs are moving without operator review." />;
  }

  return (
    <div className="nsos-card-grid">
      {items.map((item) => {
        const key = queueKey(item);
        const isPending = pendingKey === key;
        const error = errors[key];

        return (
          <article className="panel panel-pad panel-strong" key={`${item.jobId}:${item.stepId}`}>
            <div className="section-title">
              <div>
                <Link className="nsos-table-link" href={`/dashboard/jobs/${encodeURIComponent(item.jobId)}`}>
                  <span className="nsos-table-primary">{item.stepTitle}</span>
                  <span className="nsos-table-secondary">Open job details</span>
                </Link>
                <p className="section-subtitle">
                  {productTitle(item.product)} - {item.workflow}
                </p>
              </div>
              <DashboardStatusPill value={item.riskLevel} label={formatStatusLabel(item.riskLevel)} />
            </div>

            <p className="summary-detail">{item.reason}</p>

            <div className="pill-row" style={{ marginTop: 12 }}>
              <span className="pill">{item.stepType}</span>
              <span className="pill">{item.tool}</span>
              <span className="pill">{item.lane}</span>
              <span className="pill">{formatStatusLabel(item.approvalStatus)}</span>
            </div>

            <div className="detail-block" style={{ marginTop: 14 }}>
              <p className="detail-label">{item.preview.title}</p>
              <p className="detail-value">{item.preview.body}</p>
            </div>

            <div className="detail-block" style={{ marginTop: 14 }}>
              <p className="detail-label">Approval audit</p>
              {item.auditTrail.length > 0 ? (
                <div className="summary-list" style={{ marginTop: 10 }}>
                  {item.auditTrail.map((entry) => (
                    <article className="summary-item" key={`${item.jobId}:${item.stepId}:${entry.at}:${entry.action}`}>
                      <div className="summary-head">
                        <div>
                          <p className="summary-name">{approvalActionLabel(entry.action)}</p>
                          <p className="summary-detail">{formatDateTime(entry.at)}</p>
                        </div>
                        <DashboardStatusPill value={approvalActionTone(entry.action)} label={approvalActionLabel(entry.action)} />
                      </div>
                      <p className="summary-detail">{formatApprovalActor(entry.actorRole, entry.actorId)}</p>
                      <p className="summary-detail">{entry.summary}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="summary-detail" style={{ marginTop: 8 }}>
                  No approval actions have been recorded yet.
                </p>
              )}
            </div>

            {error ? (
              <div className="detail-block" style={{ marginTop: 14 }}>
                <p className="detail-label">Action failed</p>
                <p className="detail-value">{error}</p>
              </div>
            ) : null}

            <div className="form-actions" style={{ marginTop: 14 }}>
              <button
                className="button button-primary"
                disabled={!item.canApprove || hasPendingAction}
                type="button"
                onClick={() => void runAction(item, "approve")}
              >
                {isPending ? "Working..." : "Approve"}
              </button>
              <button
                className="button button-secondary"
                disabled={!item.canReject || hasPendingAction}
                type="button"
                onClick={() => void runAction(item, "reject")}
              >
                Reject
              </button>
              <button className="button button-secondary" disabled={!item.canEdit || hasPendingAction} type="button">
                Edit
              </button>
              <Link className="button button-secondary" href={`/dashboard/jobs/${encodeURIComponent(item.jobId)}`}>
                Open job
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function queueKey(item: DashboardApprovalQueueItem): string {
  return `${item.jobId}:${item.stepId}`;
}

function approvalActionLabel(action: DashboardApprovalQueueItem["auditTrail"][number]["action"]): string {
  if (action === "approve") {
    return "Approved";
  }
  if (action === "reject") {
    return "Rejected";
  }
  return "Approval requested";
}

function approvalActionTone(action: DashboardApprovalQueueItem["auditTrail"][number]["action"]): string {
  if (action === "approve") {
    return "completed";
  }
  if (action === "reject") {
    return "failed";
  }
  return "pending";
}

function formatApprovalActor(actorRole?: string, actorId?: string): string {
  if (actorRole && actorId) {
    return `${actorRole} - ${actorId}`;
  }
  if (actorRole) {
    return actorRole;
  }
  if (actorId) {
    return actorId;
  }
  return "system";
}

