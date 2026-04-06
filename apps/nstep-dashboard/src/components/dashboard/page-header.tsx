import type { ReactNode } from "react";

export function DashboardPageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  meta,
}: {
  readonly eyebrow?: string;
  readonly title: string;
  readonly subtitle: string;
  readonly actions?: ReactNode;
  readonly meta?: ReactNode;
}) {
  return (
    <section className="nsos-page-header">
      <div className="nsos-page-header-row">
        <div className="nsos-page-header-copy">
          {eyebrow ? <span className="nsos-page-kicker">{eyebrow}</span> : null}
          <h1 className="nsos-page-title">{title}</h1>
          <p className="nsos-page-subtitle">{subtitle}</p>
        </div>
        {actions || meta ? (
          <div className="nsos-page-side">
            {actions ? <div className="form-actions">{actions}</div> : null}
            {meta ? <div className="pill-row nsos-page-meta">{meta}</div> : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
