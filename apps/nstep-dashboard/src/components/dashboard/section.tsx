import type { ReactNode } from "react";

export function DashboardSection({
  title,
  subtitle,
  actions,
  children,
  className,
}: {
  readonly title: string;
  readonly subtitle?: string;
  readonly actions?: ReactNode;
  readonly children: ReactNode;
  readonly className?: string;
}) {
  return (
    <section className={`panel panel-pad panel-strong nsos-section${className ? ` ${className}` : ""}`}>
      <div className="section-title">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p className="section-subtitle nsos-section-subtitle">{subtitle}</p> : null}
        </div>
        {actions ? <div className="form-actions">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}
