import Link from "next/link";

import type { DashboardSearchField, DashboardSelectField } from "@/lib/dashboard/query";

export function DashboardQueryToolbar({
  action,
  clearHref,
  search,
  selects = [],
  note,
}: {
  readonly action: string;
  readonly clearHref: string;
  readonly search?: DashboardSearchField;
  readonly selects?: readonly DashboardSelectField[];
  readonly note?: string;
}) {
  return (
    <form className="field-grid query-grid" action={action} method="get" role="search">
      {search ? (
        <label className="query-field">
          <span className="summary-name">{search.label}</span>
          <input className="field" defaultValue={search.value} name={search.name} placeholder={search.placeholder} type="search" />
        </label>
      ) : null}

      {selects.map((field) => (
        <label className="query-field" key={field.name}>
          <span className="summary-name">{field.label}</span>
          <select className="field" defaultValue={field.value ?? ""} name={field.name}>
            {field.options.map((option) => (
              <option key={`${field.name}:${option.value}`} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ))}

      <div className="form-actions query-actions">
        <button className="button button-primary" type="submit">
          Apply filters
        </button>
        <Link className="button button-secondary" href={clearHref}>
          Clear filters
        </Link>
      </div>

      {note ? <p className="query-note">{note}</p> : null}
    </form>
  );
}
