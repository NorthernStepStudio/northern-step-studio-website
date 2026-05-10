import { VerificationResult, verificationEngine } from "@/lib/studioos/verification-engine";
import { formatDateTime } from "@/lib/dashboard/format";

export interface VerificationViewModel {
  results: Array<{
    id: string;
    appId: string;
    appLabel: string;
    status: string;
    statusTone: "ok" | "warning" | "danger";
    checks: Array<{ label: string; status: string; statusTone: "ok" | "warning" | "danger" }>;
    at: string;
  }>;
}

export function buildVerificationViewModel(results: VerificationResult[]): VerificationViewModel {
  // VerificationEngine returns category-based results; convert into UI-friendly rows.
  return {
    results: results.map(r => ({
      id: r.category,
      appId: "system",
      appLabel: r.category,
      status: String(r.status).toUpperCase(),
      statusTone: r.status === "pass" ? "ok" : r.status === "warn" ? "warning" : "danger",
      checks: (r.findings || []).map((f) => ({
        label: f.title,
        status: f.status ? String(f.status).toUpperCase() : "UNKNOWN",
        statusTone: f.status === "pass" ? "ok" : f.status === "warn" ? "warning" : "danger"
      })),
      at: formatDateTime((r.findings && r.findings[0] && r.findings[0].at) || new Date().toISOString())
    }))
  };
}

export async function loadVerificationViewModel(): Promise<VerificationViewModel> {
  const results = await verificationEngine.runFullVerification();
  return buildVerificationViewModel(results);
}
