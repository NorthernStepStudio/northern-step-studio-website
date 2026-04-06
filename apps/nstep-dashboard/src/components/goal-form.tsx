"use client";

import type { FormEvent } from "react";

import { buildTemplate, PRODUCT_ORDER, type GoalDraft } from "../lib/templates";

export function GoalForm({
  goal,
  payloadError,
  submitting,
  onChange,
  onSubmit,
}: {
  readonly goal: GoalDraft;
  readonly payloadError: string | null;
  readonly submitting: boolean;
  readonly onChange: (goal: GoalDraft) => void;
  readonly onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section>
      <div className="section-title">
        <h2>Goal intake</h2>
        <span className="section-subtitle">structured goal input</span>
      </div>
      <form className="field-grid" onSubmit={onSubmit}>
        <div className="template-strip">
          {PRODUCT_ORDER.map((product) => (
            <button
              key={product}
              type="button"
              className="template-button"
              onClick={() => onChange(buildTemplate(product))}
            >
              {product}
            </button>
          ))}
        </div>

        <input
          className="field"
          value={goal.goal}
          onChange={(event) => onChange({ ...goal, goal: event.target.value })}
          placeholder="Goal"
        />

        <div className="field-grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
          <select className="field" value={goal.product} onChange={(event) => onChange({ ...goal, product: event.target.value as GoalDraft["product"] })}>
            {PRODUCT_ORDER.map((product) => (
              <option key={product} value={product}>
                {product}
              </option>
            ))}
          </select>
          <select className="field" value={goal.priority} onChange={(event) => onChange({ ...goal, priority: event.target.value as GoalDraft["priority"] })}>
            {["low", "medium", "high", "critical"].map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>

        <div className="field-grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
          <select className="field" value={goal.mode} onChange={(event) => onChange({ ...goal, mode: event.target.value as GoalDraft["mode"] })}>
            <option value="assist">assist</option>
            <option value="autonomous">autonomous</option>
          </select>
          <input
            className="field"
            value={goal.tenantId}
            onChange={(event) => onChange({ ...goal, tenantId: event.target.value })}
            placeholder="tenant id"
          />
        </div>

        <input
          className="field"
          value={goal.requestedBy}
          onChange={(event) => onChange({ ...goal, requestedBy: event.target.value })}
          placeholder="requested by"
        />

        <textarea
          className="field"
          value={goal.constraints}
          onChange={(event) => onChange({ ...goal, constraints: event.target.value })}
          placeholder="Constraints, one per line"
        />

        <textarea
          className="field"
          value={goal.payloadText}
          onChange={(event) => onChange({ ...goal, payloadText: event.target.value })}
          placeholder="Optional payload JSON"
        />

        {payloadError ? <div className="error-banner">{payloadError}</div> : null}

        <div className="form-actions">
          <button className="button button-primary" type="submit" disabled={submitting}>
            {submitting ? "Submitting" : "Run goal"}
          </button>
          <span className="section-subtitle">
            Payload is passed directly to the workflow plan. Use the templates for fast operators.
          </span>
        </div>
      </form>
    </section>
  );
}
