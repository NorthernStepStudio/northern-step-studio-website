import Link from "next/link";

export interface DashboardActiveFilterChip {
  readonly label: string;
  readonly value: string;
  readonly href: string;
}

export function DashboardActiveFilterChips({
  chips,
  clearAllHref,
  title = "Active filters",
}: {
  readonly chips: readonly DashboardActiveFilterChip[];
  readonly clearAllHref?: string;
  readonly title?: string;
}) {
  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="active-filter-bar">
      <div className="active-filter-bar-head">
        <p className="summary-name">{title}</p>
        {clearAllHref ? (
          <Link className="button button-secondary" href={clearAllHref}>
            Clear all
          </Link>
        ) : null}
      </div>

      <div className="active-filter-chip-row">
        {chips.map((chip) => (
          <Link className="active-filter-chip" href={chip.href} key={`${chip.label}:${chip.value}`} title={`Clear ${chip.label}`}>
            <span className="active-filter-chip-label">{chip.label}</span>
            <span className="active-filter-chip-value">{chip.value}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
