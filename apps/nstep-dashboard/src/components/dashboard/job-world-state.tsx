import type { DashboardJobWorldState } from "@/lib/dashboard/contracts";
import { DashboardEmptyState } from "./empty-state";
import { DashboardSection } from "./section";
import { DashboardStatusPill } from "./status-pill";
import { formatDateTimeLong } from "@/lib/dashboard/format";

export function DashboardJobWorldStatePanel({
  worldState,
}: {
  readonly worldState?: DashboardJobWorldState;
}) {
  if (!worldState) {
    return (
      <DashboardSection title="World model" subtitle="Structured notes from the job engine">
        <DashboardEmptyState title="No world model yet" message="This job has not recorded structured world-state observations." />
      </DashboardSection>
    );
  }

  const recentObservations = [...worldState.observations].slice(-5).reverse();
  const repeatedWarnings = [...worldState.repeatedActionWarnings].slice(-3).reverse();

  return (
    <DashboardSection title="World model" subtitle="Structured notes that track state, repetition, and signals">
      <div className="nsos-stack">
        <div className="summary-list">
          <SummaryRow label="Goal" value={worldState.currentGoal} />
          <SummaryRow label="Observations" value={worldState.observations.length} />
          <SummaryRow label="Repeated actions" value={worldState.actionHistory.filter((item) => item.count >= 3).length} />
          <SummaryRow label="Touched paths" value={worldState.modifiedPaths.length} />
          <SummaryRow label="Failing tests" value={worldState.failingTests.length} />
        </div>

        {worldState.reasoningSummary ? (
          <div className="summary-item">
            <div className="summary-head">
              <p className="summary-name">Reasoning summary</p>
              <DashboardStatusPill value="system" />
            </div>
            <p className="summary-detail">{worldState.reasoningSummary}</p>
          </div>
        ) : null}

        {repeatedWarnings.length > 0 ? (
          <div className="summary-list">
            {repeatedWarnings.map((warning) => (
              <div className="summary-item" key={`${warning.fingerprint}-${warning.at}`}>
                <div className="summary-head">
                  <p className="summary-name">Circuit breaker warning</p>
                  <DashboardStatusPill value="warning" />
                </div>
                <p className="summary-detail">{warning.reason}</p>
                <p className="summary-detail">{formatDateTimeLong(warning.at)}</p>
              </div>
            ))}
          </div>
        ) : null}

        <div className="summary-list">
          {recentObservations.length > 0 ? (
            recentObservations.map((observation) => (
              <div className="summary-item" key={`${observation.fingerprint}-${observation.at}`}>
                <div className="summary-head">
                  <p className="summary-name">{observation.summary}</p>
                  <DashboardStatusPill value={observation.phase} />
                </div>
                <p className="summary-detail">
                  {formatDateTimeLong(observation.at)} · {observation.source}
                </p>
                {observation.modifiedPaths.length > 0 ? (
                  <p className="summary-detail">Modified paths: {observation.modifiedPaths.join(", ")}</p>
                ) : null}
                {observation.failingTests.length > 0 ? (
                  <p className="summary-detail">Failing tests: {observation.failingTests.join(", ")}</p>
                ) : null}
              </div>
            ))
          ) : (
            <DashboardEmptyState title="No observations" message="The job has not produced recent world-model observations yet." />
          )}
        </div>
      </div>
    </DashboardSection>
  );
}

function SummaryRow({
  label,
  value,
}: {
  readonly label: string;
  readonly value: number | string;
}) {
  return (
    <div className="summary-item">
      <div className="summary-head">
        <p className="summary-name">{label}</p>
        <span className="pill status-info">{value}</span>
      </div>
    </div>
  );
}
