"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

const tabs = [
  { href: "/dashboard", label: "tabs.home", icon: "home", match: ["/dashboard"] },
  {
    href: "/inventory",
    label: "tabs.inventory",
    icon: "box",
    match: ["/inventory", "/items"],
  },
  { href: "/scan", label: "tabs.scan", icon: "scan", match: ["/scan"] },
  { href: "/exports", label: "tabs.exports", icon: "file", match: ["/exports"] },
  {
    href: "/settings",
    label: "tabs.settings",
    icon: "gear",
    match: ["/settings"],
  },
];

function TabIcon({ name, active }: { name: string; active: boolean }) {
  const color = active ? "var(--primary)" : "var(--muted)";

  if (name === "scan") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke={color}
        strokeWidth="1.8"
      >
        <path d="M4 7V5a1 1 0 0 1 1-1h2M20 7V5a1 1 0 0 0-1-1h-2M4 17v2a1 1 0 0 0 1 1h2M20 17v2a1 1 0 0 1-1 1h-2M7 12h10" />
      </svg>
    );
  }

  if (name === "box") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke={color}
        strokeWidth="1.8"
      >
        <path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5v-9Z" />
        <path d="M12 12v9M3.5 7.5 12 12l8.5-4.5" />
      </svg>
    );
  }

  if (name === "file") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke={color}
        strokeWidth="1.8"
      >
        <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
        <path d="M14 3v6h6" />
      </svg>
    );
  }

  if (name === "gear") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke={color}
        strokeWidth="1.8"
      >
        <path d="m12 3 1.7 2.6 3-.3.9 3 2.6 1.7-1.6 2.6 1.6 2.6-2.6 1.7-.9 3-3-.3L12 21l-1.7-2.6-3 .3-.9-3-2.6-1.7 1.6-2.6-1.6-2.6 2.6-1.7.9-3 3 .3L12 3Z" />
        <circle cx="12" cy="12" r="3.2" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
    >
      <path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-8Z" />
    </svg>
  );
}

export default function BottomTabs() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <nav className="fixed inset-x-0 bottom-0 border-t border-black/5 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-3 text-xs sm:px-8">
        {tabs.map((tab) => {
          const active = tab.match.some((path) => pathname.startsWith(path));

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-1 flex-col items-center gap-1 text-[11px] font-medium"
              style={{ color: active ? "var(--primary)" : "var(--muted)" }}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--chip)]">
                <TabIcon name={tab.icon} active={active} />
              </span>
              {t(tab.label)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
