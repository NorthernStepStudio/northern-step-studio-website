import Link from "next/link";

export function ProjectNav({
  projectId,
  current,
}: {
  projectId: string;
  current: "overview" | "tasks" | "runs";
}) {
  const links = [
    { key: "overview", label: "Overview", href: `/projects/${projectId}` },
    { key: "tasks", label: "Task Board", href: `/projects/${projectId}/tasks` },
    { key: "runs", label: "Run History", href: `/projects/${projectId}/runs` },
  ] as const;

  return (
    <nav className="flex flex-wrap gap-3">
      {links.map((link) => (
        <Link
          key={link.key}
          className={link.key === current ? "btn-primary" : "btn-secondary"}
          href={link.href}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
