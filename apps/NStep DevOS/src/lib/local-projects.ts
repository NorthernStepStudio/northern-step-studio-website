export const LOCAL_PROJECTS_STORAGE_KEY = "nss-finance-tracker/projects/v1";
const STORE_EVENT = "nss-finance-tracker:store-change";

export type FinanceExpense = {
  id: string;
  name: string;
  amount: number;
  createdAt: string;
};

export type FinanceProject = {
  id: string;
  name: string;
  monthlyBudget: number;
  expenses: FinanceExpense[];
  createdAt: string;
  updatedAt: string;
};

export type FinanceProjectStore = {
  projects: FinanceProject[];
  selectedProjectId: string | null;
};

const seedProjects: FinanceProject[] = [
  {
    id: "starter-ops-runway",
    name: "Ops runway",
    monthlyBudget: 4800,
    expenses: [
      {
        id: "starter-ops-domain",
        name: "Domain renewal",
        amount: 18,
        createdAt: "2026-03-01T14:00:00.000Z",
      },
      {
        id: "starter-ops-workspace",
        name: "Workspace subscription",
        amount: 220,
        createdAt: "2026-03-05T14:00:00.000Z",
      },
    ],
    createdAt: "2026-03-01T14:00:00.000Z",
    updatedAt: "2026-03-05T14:00:00.000Z",
  },
  {
    id: "starter-growth-campaigns",
    name: "Growth campaigns",
    monthlyBudget: 3200,
    expenses: [
      {
        id: "starter-growth-copy",
        name: "Ad copy sprint",
        amount: 640,
        createdAt: "2026-03-08T14:00:00.000Z",
      },
    ],
    createdAt: "2026-03-08T14:00:00.000Z",
    updatedAt: "2026-03-08T14:00:00.000Z",
  },
];

let cachedRawStore: string | null | undefined;
let cachedStore: FinanceProjectStore | undefined;
const serverSnapshot = createServerSnapshot();

function isExpense(candidate: unknown): candidate is FinanceExpense {
  if (!candidate || typeof candidate !== "object") {
    return false;
  }

  const expense = candidate as Partial<FinanceExpense>;

  return (
    typeof expense.id === "string" &&
    typeof expense.name === "string" &&
    typeof expense.amount === "number" &&
    Number.isFinite(expense.amount) &&
    typeof expense.createdAt === "string"
  );
}

function isProject(candidate: unknown): candidate is FinanceProject {
  if (!candidate || typeof candidate !== "object") {
    return false;
  }

  const project = candidate as Partial<FinanceProject>;

  return (
    typeof project.id === "string" &&
    typeof project.name === "string" &&
    typeof project.monthlyBudget === "number" &&
    Number.isFinite(project.monthlyBudget) &&
    typeof project.createdAt === "string" &&
    typeof project.updatedAt === "string" &&
    Array.isArray(project.expenses) &&
    project.expenses.every((expense) => isExpense(expense))
  );
}

function cloneProject(project: FinanceProject): FinanceProject {
  return {
    ...project,
    expenses: project.expenses.map((expense) => ({ ...expense })),
  };
}

export function createDefaultProjectStore(): FinanceProjectStore {
  return {
    projects: seedProjects.map((project) => cloneProject(project)),
    selectedProjectId: seedProjects[0]?.id ?? null,
  };
}

function createServerSnapshot() {
  return createDefaultProjectStore();
}

export function parseProjectStore(raw: string | null): FinanceProjectStore | null {
  if (!raw) {
    return null;
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!parsed || typeof parsed !== "object") {
    return null;
  }

  const store = parsed as Partial<FinanceProjectStore>;

  if (!Array.isArray(store.projects) || !store.projects.every((project) => isProject(project))) {
    return null;
  }

  const selectedProjectId =
    typeof store.selectedProjectId === "string" ? store.selectedProjectId : null;

  return {
    projects: store.projects.map((project) => cloneProject(project)),
    selectedProjectId,
  };
}

function getCachedStore(raw: string | null): FinanceProjectStore {
  if (raw === cachedRawStore && cachedStore) {
    return cachedStore;
  }

  cachedRawStore = raw;
  cachedStore = parseProjectStore(raw) ?? createDefaultProjectStore();

  return cachedStore;
}

export function getProjectStoreSnapshot() {
  if (typeof window === "undefined") {
    return serverSnapshot;
  }

  return getCachedStore(window.localStorage.getItem(LOCAL_PROJECTS_STORAGE_KEY));
}

export function getProjectStoreServerSnapshot() {
  return serverSnapshot;
}

export function subscribeToProjectStore(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleChange = () => onStoreChange();

  window.addEventListener("storage", handleChange);
  window.addEventListener(STORE_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(STORE_EVENT, handleChange);
  };
}

export function writeProjectStore(store: FinanceProjectStore) {
  if (typeof window === "undefined") {
    return;
  }

  const serialized = JSON.stringify(store);
  cachedRawStore = serialized;
  cachedStore = store;
  window.localStorage.setItem(LOCAL_PROJECTS_STORAGE_KEY, serialized);
  window.dispatchEvent(new Event(STORE_EVENT));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatShortDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

export function buildProject(name: string, monthlyBudget: number): FinanceProject {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    monthlyBudget,
    expenses: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function buildExpense(name: string, amount: number): FinanceExpense {
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    amount,
    createdAt: new Date().toISOString(),
  };
}

export function getProjectSummary(project: FinanceProject) {
  const spent = project.expenses.reduce((total, expense) => total + expense.amount, 0);
  const remaining = project.monthlyBudget - spent;
  const utilization = project.monthlyBudget > 0 ? spent / project.monthlyBudget : 0;

  return {
    spent,
    remaining,
    expenseCount: project.expenses.length,
    utilization,
    healthLabel:
      utilization >= 1 ? "Over budget" : utilization >= 0.75 ? "Watch closely" : "Healthy",
  };
}

export function getPortfolioSummary(projects: FinanceProject[]) {
  const totalBudget = projects.reduce((total, project) => total + project.monthlyBudget, 0);
  const totalSpent = projects.reduce(
    (total, project) => total + getProjectSummary(project).spent,
    0,
  );

  return {
    activeProjects: projects.length,
    totalBudget,
    totalSpent,
    remainingBudget: totalBudget - totalSpent,
  };
}
