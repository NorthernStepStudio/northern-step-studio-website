import type { ProductKey } from "./contracts";

export interface DashboardNavItem {
  readonly href: string;
  readonly label: string;
  readonly detail: string;
}

export interface DashboardNavGroup {
  readonly label: string;
  readonly items: readonly DashboardNavItem[];
}

export interface ProductMeta {
  readonly product: ProductKey;
  readonly title: string;
  readonly description: string;
  readonly href: string;
  readonly navLabel: string;
}

export const productMeta = {
  "lead-recovery": {
    product: "lead-recovery",
    title: "Lead Recovery",
    description: "Missed-call follow-up, suppression rules, and SMS delivery.",
    href: "/dashboard/apps/lead-recovery",
    navLabel: "Lead Recovery",
  },
  nexusbuild: {
    product: "nexusbuild",
    title: "NexusBuild",
    description: "PC build analysis, pricing, compatibility, and recommendations.",
    href: "/dashboard/apps/nexusbuild",
    navLabel: "NexusBuild",
  },
  provly: {
    product: "provly",
    title: "ProvLy",
    description: "Inventory organization, claim readiness, and documentation tracking.",
    href: "/dashboard/apps/provly",
    navLabel: "ProvLy",
  },
  neurormoves: {
    product: "neurormoves",
    title: "NeuroMoves",
    description: "Routine support, progress summaries, and recurring check-ins.",
    href: "/dashboard/apps/neurormoves",
    navLabel: "NeuroMoves",
  },
  synox: {
    product: "synox",
    title: "Synox Engine",
    description: "AI reasoning engine, bridge management, and local model orchestration.",
    href: "/dashboard/apps/synox",
    navLabel: "Synox",
  },
  matterhorn: {
    product: "matterhorn",
    title: "Matterhorn",
    description: "Executive advisory intelligence and guided manual interventions.",
    href: "/dashboard/apps/matterhorn",
    navLabel: "Matterhorn",
  },
  website: {
    product: "website",
    title: "Studio Website",
    description: "Public presence, marketing automation, and lead intake.",
    href: "/dashboard/apps/website",
    navLabel: "Website",
  },
  buildcenter: {
    product: "buildcenter",
    title: "Build Center",
    description: "Mobile build orchestration, credential management, and release logs.",
    href: "/dashboard/apps/buildcenter",
    navLabel: "Build Center",
  },
  roguelike: {
    product: "roguelike",
    title: "Roguelike / Doomed",
    description: "Game engine status, player telemetry, and experimental features.",
    href: "/dashboard/apps/roguelike",
    navLabel: "Games",
  },
} satisfies Record<ProductKey, ProductMeta>;

export const dashboardNavGroups: readonly DashboardNavGroup[] = [
  {
    label: "Operations",
    items: [
      {
        href: "/dashboard",
        label: "Executive center",
        detail: "Top-level operational health, priorities, and command actions.",
      },
      {
        href: "/dashboard/jobs",
        label: "Projects",
        detail: "Active and historical workstreams with execution context.",
      },
      {
        href: "/dashboard/activity",
        label: "Operational pipeline",
        detail: "Merged execution flow across build, verification, and release.",
      },
      {
        href: productMeta.nexusbuild.href,
        label: "Build center",
        detail: "NexusBuild operational lane and release throughput.",
      },
      {
        href: productMeta.provly.href,
        label: "Deployments",
        detail: "ProvLy delivery and rollout visibility.",
      },
      {
        href: "/dashboard/settings",
        label: "Release readiness",
        detail: "Readiness gates and final operational controls.",
      },
      {
        href: "/dashboard/incidents",
        label: "Incidents",
        detail: "Operational incident management, coordination, and mitigation.",
      },
      {
        href: "/dashboard/timeline",
        label: "Timeline",
        detail: "Chronological studio history across all operational lanes.",
      },
    ],
  },
  {
    label: "Intelligence",
    items: [
      {
        href: "/dashboard/activity",
        label: "Matterhorn",
        detail: "Executive advisory intelligence and recommended actions.",
      },
      {
        href: "/dashboard/memory",
        label: "Operational memory",
        detail: "Persistent context, signals, and workflow memory.",
      },
      {
        href: "/dashboard/intelligence",
        label: "Operational intelligence",
        detail: "Architecture mapping, relationship graph, and pattern analysis.",
      },
      {
        href: productMeta.neurormoves.href,
        label: "Analytics",
        detail: "Performance trends and telemetry across active lanes.",
      },
      {
        href: productMeta["lead-recovery"].href,
        label: "Business intelligence",
        detail: "Product-side outcome signals and intervention patterns.",
      },
      {
        href: "/dashboard/execution",
        label: "Execution console",
        detail: "Controlled operational procedures, workflows, and safe execution.",
      },
      {
        href: "/dashboard/recovery",
        label: "Recovery workspace",
        detail: "Snapshot-backed recovery coordination and rollback readiness.",
      },
    ],
  },
  {
    label: "Governance",
    items: [
      {
        href: "/dashboard/approvals",
        label: "Action queue",
        detail: "Governance-first review queue for high-impact operations.",
      },
      {
        href: "/dashboard/verification",
        label: "Verification",
        detail: "Operational audit signals and automated integrity checks.",
      },
      {
        href: "/dashboard/snapshots",
        label: "Snapshots",
        detail: "Memory-backed operational snapshots and recoverability context.",
      },
      {
        href: "/dashboard/risk-register",
        label: "Risk register",
        detail: "Live risks, blockers, and architecture drift alerts.",
      },
      {
        href: "/dashboard/governance",
        label: "Governance center",
        detail: "Centralized policy, integrity, and compliance dashboard.",
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        href: "/dashboard/settings",
        label: "Settings",
        detail: "Policy, tenant controls, templates, and runtime safety boundaries.",
      },
    ],
  },
];

export function isProductKey(value: string): value is ProductKey {
  return value in productMeta;
}

export function getProductMeta(product: ProductKey): ProductMeta {
  return productMeta[product];
}

export function getDashboardRouteMeta(pathname: string): { readonly title: string; readonly detail: string } {
  if (pathname === "/dashboard") {
    return {
      title: "Executive center",
      detail: "Governance-first command view for operations, risk, approvals, and system health.",
    };
  }

  if (pathname === "/dashboard/approvals") {
    return {
      title: "Action queue",
      detail: "Manual review lane for high-impact actions, blockers, and governance control points.",
    };
  }

  if (pathname === "/dashboard/jobs") {
    return {
      title: "Projects",
      detail: "Operational project stream with execution history, ownership, and traceability.",
    };
  }

  if (pathname === "/dashboard/activity") {
    return {
      title: "Operational pipeline",
      detail: "Merged execution pipeline across lanes with verification signals and advisory context.",
    };
  }

  if (pathname === "/dashboard/memory") {
    return {
      title: "Operational memory",
      detail: "Persistent memory, snapshots, and trace context for governance-aware execution.",
    };
  }

  if (pathname === "/dashboard/settings") {
    return {
      title: "Settings",
      detail: "Review tenant rules, approval policy, suppression rules, and communication templates.",
    };
  }

  if (pathname === "/dashboard/governance") {
    return {
      title: "Governance center",
      detail: "Operational integrity, policy compliance, and architecture drift monitoring.",
    };
  }

  if (pathname === "/dashboard/verification") {
    return {
      title: "Verification center",
      detail: "Automated operational audits, build verification, and runtime safety checks.",
    };
  }

  if (pathname === "/dashboard/risk-register") {
    return {
      title: "Risk register",
      detail: "Operational risk tracking, mitigation status, and high-impact blockers.",
    };
  }

  if (pathname === "/dashboard/snapshots") {
    return {
      title: "Snapshots",
      detail: "Operational memory snapshots, recovery readiness, and state integrity.",
    };
  }

  if (pathname === "/dashboard/incidents") {
    return {
      title: "Incidents",
      detail: "Coordinate operational responses to build failures, drift, and system instability.",
    };
  }

  if (pathname === "/dashboard/timeline") {
    return {
      title: "Operational timeline",
      detail: "Merged chronological history of studio events, deployments, and verification passes.",
    };
  }

  if (pathname === "/dashboard/execution") {
    return {
      title: "Execution console",
      detail: "Coordinate and track approved operational procedures, bridge restarts, and diagnostics.",
    };
  }

  if (pathname === "/dashboard/recovery") {
    return {
      title: "Recovery workspace",
      detail: "Analyze snapshots, estimate rollback impact, and coordinate studio-wide restoration.",
    };
  }

  if (pathname === "/dashboard/intelligence") {
    return {
      title: "Operational intelligence",
      detail: "Studio-wide knowledge graph, dependency maps, and operational pattern detection.",
    };
  }

  const appMatch = pathname.match(/^\/dashboard\/apps\/([^/]+)$/);
  if (appMatch) {
    const product = appMatch[1];
    if (isProductKey(product)) {
      return {
        title: getProductMeta(product).title,
        detail: getProductMeta(product).description,
      };
    }
  }

  const jobMatch = pathname.match(/^\/dashboard\/jobs\/([^/]+)$/);
  if (jobMatch) {
    return {
      title: "Job detail",
      detail: "Inspect the execution timeline, logs, memory updates, and outcome for one job.",
    };
  }

  return {
    title: "NStepOS",
    detail: "Operational surface for autonomous business workflows.",
  };
}

export function productHref(product: ProductKey): string {
  return productMeta[product].href;
}
