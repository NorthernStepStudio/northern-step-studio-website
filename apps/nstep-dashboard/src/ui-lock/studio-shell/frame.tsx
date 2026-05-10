import type { ReactNode } from "react";
import type { RefObject } from "react";

export function StudioShellFrame({
  sidebar,
  topbar,
  children,
  mainRef,
}: {
  readonly sidebar: ReactNode;
  readonly topbar: ReactNode;
  readonly children: ReactNode;
  readonly mainRef?: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="nsos-shell">
      <aside className="nsos-sidebar">{sidebar}</aside>
      <div className="nsos-main" ref={mainRef}>
        {topbar}
        <main className="nsos-content">{children}</main>
      </div>
    </div>
  );
}
