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
    href: "/dashboard/panels/lead-recovery",
    navLabel: "Lead Recovery",
  },
  nexusbuild: {
    product: "nexusbuild",
    title: "NexusBuild",
    description: "PC build analysis, pricing, compatibility, and recommendations.",
    href: "/dashboard/panels/nexusbuild",
    navLabel: "NexusBuild",
  },
  provly: {
    product: "provly",
    title: "ProvLy",
    description: "Inventory organization, claim readiness, and documentation tracking.",
    href: "/dashboard/panels/provly",
    navLabel: "ProvLy",
  },
  neurormoves: {
    product: "neurormoves",
    title: "NeuroMoves",
    description: "Routine support, progress summaries, and recurring check-ins.",
    href: "/dashboard/panels/neurormoves",
    navLabel: "NeuroMoves",
  },
} satisfies Record<ProductKey, ProductMeta>;

export const dashboardNavGroups: readonly DashboardNavGroup[] = [
  {
    label: "Workspace",
    items: [
      {
        href: "/dashboard",
        label: "Home",
        detail: "Live queue, approvals, alerts, and product coverage.",
      },
      {
        href: "/dashboard/jobs",
        label: "Jobs",
        detail: "Search and filter the full workflow run history.",
      },
      {
        href: "/dashboard/approvals",
        label: "Approval queue",
        detail: "Risky or uncertain actions waiting on review.",
      },
      {
        href: "/dashboard/activity",
        label: "Workflow activity",
        detail: "Active jobs, recurring jobs, lane type, and failures.",
      },
      {
        href: "/dashboard/memory",
        label: "Memory",
        detail: "Saved patterns, preferences, and audit trace.",
      },
      {
        href: "/dashboard/settings",
        label: "Settings",
        detail: "Tenant rules, approvals, templates, and safety boundaries.",
      },
    ],
  },
  {
    label: "Product panels",
    items: [
      {
        href: productMeta["lead-recovery"].href,
        label: productMeta["lead-recovery"].title,
        detail: productMeta["lead-recovery"].description,
      },
      {
        href: productMeta.nexusbuild.href,
        label: productMeta.nexusbuild.title,
        detail: productMeta.nexusbuild.description,
      },
      {
        href: productMeta.provly.href,
        label: productMeta.provly.title,
        detail: productMeta.provly.description,
      },
      {
        href: productMeta.neurormoves.href,
        label: productMeta.neurormoves.title,
        detail: productMeta.neurormoves.description,
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
      title: "Home",
      detail: "Live overview of jobs, approvals, logs, memory, and product activity.",
    };
  }

  if (pathname === "/dashboard/approvals") {
    return {
      title: "Approval queue",
      detail: "Review steps and actions that require operator approval.",
    };
  }

  if (pathname === "/dashboard/jobs") {
    return {
      title: "Jobs",
      detail: "Browse, search, and filter workflow runs across the system.",
    };
  }

  if (pathname === "/dashboard/activity") {
    return {
      title: "Workflow activity",
      detail: "Track active lanes, recurring jobs, and execution health by product.",
    };
  }

  if (pathname === "/dashboard/memory") {
    return {
      title: "Memory",
      detail: "Inspect saved workflow patterns, user preferences, and audit history.",
    };
  }

  if (pathname === "/dashboard/settings") {
    return {
      title: "Settings",
      detail: "Review tenant rules, approval policy, suppression rules, and communication templates.",
    };
  }

  const panelMatch = pathname.match(/^\/dashboard\/panels\/([^/]+)$/);
  if (panelMatch) {
    const product = panelMatch[1];
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
