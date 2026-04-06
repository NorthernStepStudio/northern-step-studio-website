/**
 * tracing.ts — NStep AI Lightweight Observability
 *
 * Structured tracing spans aligned to the pipeline stages.
 * Wraps each stage with timing, metadata, and error capture.
 *
 * Philosophy:
 *   - Zero dependencies on OpenTelemetry SDK (avoid Edge bundle size increase)
 *   - Writes to console in structured JSON for Cloudflare/Vercel log aggregation
 *   - Produces a `TraceReport` that flows into the Thought Accordion UI
 *
 * Phase 4 upgrade path:
 *   - Replace `consoleEmit` with `@opentelemetry/api` tracer.startSpan() calls
 *   - Map TraceSpan fields → OTel span attributes directly (1:1)
 */

// ─── Public Types ─────────────────────────────────────────────────────────────

export type SpanName =
  | "nstep_ai.route_selected"
  | "nstep_ai.knowledge_search"
  | "nstep_ai.generation"
  | "nstep_ai.answer_verified"
  | "nstep_ai.ui_render";

export interface TraceSpan {
  readonly name: SpanName;
  readonly startMs: number;
  readonly durationMs: number;
  readonly ok: boolean;
  readonly attributes: Record<string, string | number | boolean | null>;
  readonly error?: string;
}

/**
 * A full trace report for one chat turn.
 * Returned to the frontend in the API response so the Thought Accordion
 * can render evidence chips and timing breakdowns.
 */
export interface TraceReport {
  readonly sessionId: string;
  readonly requestId: string;
  readonly spans: readonly TraceSpan[];
  readonly totalDurationMs: number;
  readonly route: string;
  readonly lane: string | null;
  readonly confidence: "low" | "medium" | "high";
  readonly retrievedChunks: readonly TraceChunkRef[];
}

/** A lightweight reference to a retrieved chunk for the Thought Accordion. */
export interface TraceChunkRef {
  readonly chunkId: string;
  readonly docId: string;
  readonly title: string | null;
  readonly section: string | null;
  readonly lane: string;
  readonly score: number;
  readonly sourceUrl: string | null;
}

// ─── Tracer ───────────────────────────────────────────────────────────────────

export class PipelineTracer {
  private readonly spans: TraceSpan[] = [];
  private readonly startMs: number;
  readonly sessionId: string;
  readonly requestId: string;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.requestId = generateId();
    this.startMs = Date.now();
  }

  /**
   * Record a pipeline span. Call this after each stage completes.
   */
  span(
    name: SpanName,
    durationMs: number,
    attributes: TraceSpan["attributes"],
    error?: string,
  ): void {
    const s: TraceSpan = {
      name,
      startMs: Date.now() - durationMs,
      durationMs: Math.round(durationMs),
      ok: !error,
      attributes,
      ...(error ? { error } : {}),
    };

    this.spans.push(s);
    consoleEmit(this.requestId, s);
  }

  /**
   * Convenience: time an async operation and record it as a span.
   */
  async time<T>(
    name: SpanName,
    attributes: Omit<TraceSpan["attributes"], "durationMs">,
    fn: () => Promise<T>,
  ): Promise<T> {
    const t0 = Date.now();
    try {
      const result = await fn();
      this.span(name, Date.now() - t0, { ...attributes, ok: true });
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.span(name, Date.now() - t0, attributes, msg);
      throw err;
    }
  }

  /**
   * Build the final TraceReport to attach to the API response.
   */
  report(opts: {
    route: string;
    lane: string | null;
    confidence: TraceReport["confidence"];
    retrievedChunks?: readonly TraceChunkRef[];
  }): TraceReport {
    return {
      sessionId: this.sessionId,
      requestId: this.requestId,
      spans: [...this.spans],
      totalDurationMs: Date.now() - this.startMs,
      route: opts.route,
      lane: opts.lane,
      confidence: opts.confidence,
      retrievedChunks: opts.retrievedChunks ?? [],
    };
  }
}

// ─── Evaluation Gate ──────────────────────────────────────────────────────────

/**
 * Regression check: call this in CI or via health endpoint to detect quality
 * degradation. Returns true if the metrics pass all thresholds.
 */
export interface QualityMetrics {
  routeAccuracy: number;       // 0–1. Fail if < 0.90
  emptyRetrievalRate: number;  // 0–1. Fail if > 0.10
  avgConfidence: number;       // 0–1. Warn if < 0.40
}

export function evaluateQualityGate(metrics: QualityMetrics): {
  passed: boolean;
  failures: string[];
  warnings: string[];
} {
  const failures: string[] = [];
  const warnings: string[] = [];

  if (metrics.routeAccuracy < 0.90) {
    failures.push(`Route accuracy ${(metrics.routeAccuracy * 100).toFixed(1)}% is below 90% threshold.`);
  }

  if (metrics.emptyRetrievalRate > 0.10) {
    failures.push(`Empty retrieval rate ${(metrics.emptyRetrievalRate * 100).toFixed(1)}% exceeds 10% threshold.`);
  }

  if (metrics.avgConfidence < 0.40) {
    warnings.push(`Average confidence ${(metrics.avgConfidence * 100).toFixed(1)}% is below 40% — consider adding more knowledge chunks.`);
  }

  return {
    passed: failures.length === 0,
    failures,
    warnings,
  };
}

// ─── Internal ─────────────────────────────────────────────────────────────────

function consoleEmit(requestId: string, span: TraceSpan): void {
  // Structured JSON — captured by Cloudflare Workers log drain / Vercel log ingestion
  const entry = {
    ts: new Date().toISOString(),
    type: "nstep_ai_span",
    requestId,
    span: span.name,
    durationMs: span.durationMs,
    ok: span.ok,
    ...span.attributes,
    ...(span.error ? { error: span.error } : {}),
  };

  if (span.ok) {
    console.log(JSON.stringify(entry));
  } else {
    console.error(JSON.stringify(entry));
  }
}

function generateId(): string {
  // Runs in Edge (no crypto.randomUUID on all platforms), safe fallback
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID().slice(0, 8);
  }
  return Math.random().toString(36).slice(2, 10);
}
