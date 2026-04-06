"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { formatDateTimeLong, formatRatio } from "@/lib/dashboard/format";
import { DashboardStatusPill } from "./status-pill";

type UploadStatus = "idle" | "submitting" | "success" | "error";

type ProvLyUploadExtractionSummary = {
  readonly candidateCount: number;
  readonly extractedItemCount: number;
  readonly extractedReceiptCount: number;
  readonly attachmentCount: number;
  readonly ocrStatus: "used" | "blocked" | "fallback" | "unavailable";
  readonly ocrProvider?: string;
  readonly usedOcr: boolean;
  readonly notes: readonly string[];
  readonly extractedAt: string;
};

type ProvLyUploadSummary = {
  readonly caseId: string;
  readonly claimantName: string;
  readonly claimType: string;
  readonly jobId?: string;
  readonly jobStatus: string;
  readonly approvalStatus: string;
  readonly visualAssetCount: number;
  readonly attachmentCount: number;
  readonly receiptCount: number;
  readonly reportStatus?: string;
  readonly reportSummary?: string;
  readonly extraction?: ProvLyUploadExtractionSummary;
};

export function DashboardProvLyUploadForm({
  tenantId,
  defaultCaseId,
}: {
  readonly tenantId?: string;
  readonly defaultCaseId?: string;
}) {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [message, setMessage] = useState<string>("Upload photos, receipts, and scans to extract inventory records.");
  const [photoNames, setPhotoNames] = useState<readonly string[]>([]);
  const [receiptNames, setReceiptNames] = useState<readonly string[]>([]);
  const [latestUpload, setLatestUpload] = useState<ProvLyUploadSummary | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const photoInput = form.querySelector<HTMLInputElement>('input[name="visualAssets"]');
    const receiptInput = form.querySelector<HTMLInputElement>('input[name="receipts"]');
    if ((photoInput?.files?.length || 0) + (receiptInput?.files?.length || 0) === 0) {
      setStatus("error");
      setMessage("Choose at least one photo, scan, or receipt before uploading.");
      return;
    }

    setStatus("submitting");
    setMessage("Uploading files and starting ProvLy analysis...");

    try {
      const response = await fetch("/api/nstep/v1/workflows/provly/upload", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as {
        job?: Record<string, unknown>;
        upload?: Partial<ProvLyUploadSummary> & {
          readonly extraction?: Partial<ProvLyUploadExtractionSummary>;
        };
        error?: { readonly message?: string };
      };

      if (!response.ok) {
        throw new Error(payload.error?.message || "ProvLy upload failed.");
      }

      setLatestUpload(buildUploadSummary(payload, formData));
      setStatus("success");
      setMessage("Upload accepted. The latest upload summary is shown below.");
      return;
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    }
  }

  return (
    <form className="field-grid query-grid" onSubmit={handleSubmit}>
      <input name="tenantId" type="hidden" value={tenantId || "default"} />

      <label className="query-field">
        <span className="summary-name">Claimant name</span>
        <input className="field" name="claimantName" placeholder="Household name or claimant" type="text" />
      </label>

      <label className="query-field">
        <span className="summary-name">Claim type</span>
        <select className="field" name="claimType" defaultValue="home inventory">
          <option value="home inventory">Home inventory</option>
          <option value="fire">Fire loss</option>
          <option value="theft">Theft loss</option>
          <option value="water damage">Water damage</option>
          <option value="other">Other</option>
        </select>
      </label>

      <label className="query-field">
        <span className="summary-name">Case ID</span>
        <input className="field" name="caseId" placeholder="Optional case reference" type="text" defaultValue={defaultCaseId} />
      </label>

      <label className="query-field">
        <span className="summary-name">Workflow goal</span>
        <textarea
          className="field"
          name="goal"
          placeholder="Organize the uploaded inventory and prepare a claim-ready ProvLy report."
          rows={3}
        />
      </label>

      <label className="query-field">
        <span className="summary-name">Notes</span>
        <textarea
          className="field"
          name="notes"
          placeholder="Add context for the inventory review, policy, or claim packet."
          rows={3}
        />
      </label>

      <label className="query-field">
        <span className="summary-name">Photos and scans</span>
        <input
          className="field"
          name="visualAssets"
          type="file"
          accept="image/*,application/pdf"
          multiple
          onChange={(event) => setPhotoNames(listFileNames(event.currentTarget.files))}
        />
        <span className="query-note">
          {photoNames.length > 0 ? `${photoNames.length} photo/scan file(s) selected.` : "Upload item photos or document scans."}
        </span>
      </label>

      <label className="query-field">
        <span className="summary-name">Receipts</span>
        <input
          className="field"
          name="receipts"
          type="file"
          accept="image/*,application/pdf"
          multiple
          onChange={(event) => setReceiptNames(listFileNames(event.currentTarget.files))}
        />
        <span className="query-note">
          {receiptNames.length > 0 ? `${receiptNames.length} receipt file(s) selected.` : "Upload receipts, invoices, or proof-of-purchase files."}
        </span>
      </label>

      <label className="query-field">
        <span className="summary-name">Execution mode</span>
        <select className="field" name="mode" defaultValue="assist">
          <option value="assist">Assist</option>
          <option value="autonomous">Autonomous</option>
        </select>
      </label>

      <div className="form-actions query-actions">
        <button className="button button-primary" type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? "Uploading..." : "Upload and analyze"}
        </button>
      </div>

      <p className="query-note">{message}</p>

      {latestUpload ? (
        <article className="summary-item">
          <div className="summary-head">
            <div>
              <p className="summary-name">{latestUpload.caseId}</p>
              <p className="summary-detail">
                {latestUpload.claimantName} - {latestUpload.claimType}
              </p>
            </div>
            <div className="pill-row">
              <DashboardStatusPill value={latestUpload.jobStatus} />
              <DashboardStatusPill value={latestUpload.approvalStatus} />
              <DashboardStatusPill
                value={latestUpload.extraction?.ocrStatus || "pending"}
                label={latestUpload.extraction ? formatExtractionLabel(latestUpload.extraction.ocrStatus) : "Extraction pending"}
              />
            </div>
          </div>

          <div className="metric-grid" style={{ marginTop: "12px" }}>
            <Metric label="Visual assets" value={latestUpload.visualAssetCount} detail={`${latestUpload.attachmentCount} attachment(s)`} />
            <Metric label="Receipts" value={latestUpload.receiptCount} detail={latestUpload.jobId ? `Job ${latestUpload.jobId}` : "Queued for analysis"} />
            <Metric
              label="OCR"
              value={latestUpload.extraction ? `${latestUpload.extraction.extractedItemCount} items` : "pending"}
              detail={latestUpload.extraction?.ocrProvider ? `${latestUpload.extraction.ocrProvider} provider` : "Awaiting worker extraction"}
            />
            <Metric
              label="Extraction"
              value={latestUpload.extraction ? `${latestUpload.extraction.extractedReceiptCount} receipts` : "pending"}
              detail={latestUpload.extraction ? formatDateTimeLong(latestUpload.extraction.extractedAt) : "OCR summary pending"}
            />
          </div>

          <p className="summary-detail" style={{ marginTop: "12px" }}>
            {latestUpload.reportSummary || "The upload was accepted. The worker will finish the extraction and report as soon as it runs."}
          </p>

          {latestUpload.extraction?.notes?.length ? (
            <div className="summary-list" style={{ marginTop: "12px" }}>
              {latestUpload.extraction.notes.slice(0, 3).map((note) => (
                <article className="summary-item" key={note}>
                  <p className="summary-detail">{note}</p>
                </article>
              ))}
            </div>
          ) : null}

          {latestUpload.jobId ? (
            <div className="nsos-empty-action">
              <Link className="button button-secondary" href={`/dashboard/jobs/${encodeURIComponent(latestUpload.jobId)}`}>
                Open job detail
              </Link>
            </div>
          ) : null}
        </article>
      ) : null}
    </form>
  );
}

function listFileNames(files: FileList | null): readonly string[] {
  if (!files || files.length === 0) {
    return [];
  }
  return Array.from(files).map((file) => file.name);
}

function buildUploadSummary(
  payload: {
    readonly job?: Record<string, unknown>;
    readonly upload?: Partial<ProvLyUploadSummary> & {
      readonly extraction?: Partial<ProvLyUploadExtractionSummary>;
    };
  },
  formData: FormData,
): ProvLyUploadSummary {
  const job = payload.job || {};
  const upload = payload.upload || {};
  const goal = isRecord(job.goal) ? job.goal : {};
  const goalPayload = isRecord(goal.payload) ? goal.payload : {};
  const provly = isRecord(goalPayload.provly) ? goalPayload.provly : {};
  const result = isRecord(job.result) ? job.result : {};
  const resultData = isRecord(result.data) ? result.data : {};
  const dashboard = isRecord(resultData.dashboard) ? resultData.dashboard : {};
  const report = isRecord(resultData.report) ? resultData.report : {};
  const reportMetadata = isRecord(report.metadata) ? report.metadata : {};
  const extraction = normalizeExtraction(upload.extraction) || normalizeExtraction(dashboard.visualExtraction) || normalizeExtraction(reportMetadata.visualExtraction);

  const caseId = stringValue(upload.caseId) || stringValue(provly.caseId) || stringValue(formData.get("caseId")) || "case pending";
  const claimantName =
    stringValue(upload.claimantName) || stringValue(provly.claimantName) || stringValue(formData.get("claimantName")) || "Household inventory";
  const claimType = stringValue(upload.claimType) || stringValue(provly.claimType) || stringValue(formData.get("claimType")) || "home inventory";

  return {
    caseId,
    claimantName,
    claimType,
    jobId: stringValue(upload.jobId) || stringValue(job.jobId),
    jobStatus: stringValue(upload.jobStatus) || stringValue(job.status) || "queued",
    approvalStatus: stringValue(upload.approvalStatus) || stringValue(job.approvalStatus) || "pending",
    visualAssetCount: numberValue(upload.visualAssetCount) ?? arrayLength(formData.get("visualAssets")),
    attachmentCount: numberValue(upload.attachmentCount) ?? arrayLength(formData.get("visualAssets")),
    receiptCount: numberValue(upload.receiptCount) ?? arrayLength(formData.get("receipts")),
    reportStatus: stringValue(upload.reportStatus) || stringValue(result.status),
    reportSummary: stringValue(upload.reportSummary) || stringValue(result.summary),
    extraction,
  };
}

function normalizeExtraction(value: unknown): ProvLyUploadExtractionSummary | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const ocrStatus = value.ocrStatus;
  if (ocrStatus !== "used" && ocrStatus !== "blocked" && ocrStatus !== "fallback" && ocrStatus !== "unavailable") {
    return undefined;
  }

  return {
    candidateCount: numberValue(value.candidateCount) ?? 0,
    extractedItemCount: numberValue(value.extractedItemCount) ?? 0,
    extractedReceiptCount: numberValue(value.extractedReceiptCount) ?? 0,
    attachmentCount: numberValue(value.attachmentCount) ?? 0,
    ocrStatus,
    ocrProvider: stringValue(value.ocrProvider),
    usedOcr: Boolean(value.usedOcr),
    notes: Array.isArray(value.notes) ? value.notes.filter((note): note is string => typeof note === "string") : [],
    extractedAt: stringValue(value.extractedAt) || new Date().toISOString(),
  };
}

function formatExtractionLabel(value: ProvLyUploadExtractionSummary["ocrStatus"]): string {
  if (value === "used") {
    return "OCR used";
  }
  if (value === "blocked") {
    return "OCR blocked";
  }
  if (value === "fallback") {
    return "OCR fallback";
  }
  return "OCR unavailable";
}

function stringValue(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  return undefined;
}

function numberValue(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function arrayLength(value: FormDataEntryValue | null): number {
  return value ? 1 : 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function Metric({
  label,
  value,
  detail,
}: {
  readonly label: string;
  readonly value: number | string;
  readonly detail?: string;
}) {
  return (
    <article className="metric-card">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      {detail ? <div className="metric-note">{detail}</div> : null}
    </article>
  );
}
