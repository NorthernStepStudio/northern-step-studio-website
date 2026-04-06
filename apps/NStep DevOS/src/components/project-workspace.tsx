"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";

import {
  buildExpense,
  buildProject,
  formatCurrency,
  formatShortDate,
  getProjectStoreServerSnapshot,
  getProjectStoreSnapshot,
  getPortfolioSummary,
  getProjectSummary,
  subscribeToProjectStore,
  writeProjectStore,
} from "@/lib/local-projects";

type ProjectWorkspaceProps = {
  activeProjectId?: string;
};

type ProjectFormState = {
  name: string;
  monthlyBudget: string;
};

type ExpenseFormState = {
  name: string;
  amount: string;
};

const initialProjectForm: ProjectFormState = {
  name: "",
  monthlyBudget: "2500",
};

const initialExpenseForm: ExpenseFormState = {
  name: "",
  amount: "",
};

export function ProjectWorkspace({ activeProjectId }: ProjectWorkspaceProps) {
  const router = useRouter();
  const store = useSyncExternalStore(
    subscribeToProjectStore,
    getProjectStoreSnapshot,
    getProjectStoreServerSnapshot,
  );
  const [projectForm, setProjectForm] = useState<ProjectFormState>(initialProjectForm);
  const [expenseForm, setExpenseForm] = useState<ExpenseFormState>(initialExpenseForm);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [expenseError, setExpenseError] = useState<string | null>(null);

  const activeProject =
    store.projects.find((project) => project.id === activeProjectId) ??
    store.projects.find((project) => project.id === store.selectedProjectId) ??
    store.projects[0] ??
    null;

  const portfolioSummary = getPortfolioSummary(store.projects);
  const activeSummary = activeProject ? getProjectSummary(activeProject) : null;
  const selectedProjectMissing = Boolean(
    activeProjectId && !store.projects.some((project) => project.id === activeProjectId),
  );

  function createProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProjectError(null);

    const monthlyBudget = Number(projectForm.monthlyBudget);

    if (!projectForm.name.trim()) {
      setProjectError("Add a project name to create a new dashboard.");
      return;
    }

    if (!Number.isFinite(monthlyBudget) || monthlyBudget <= 0) {
      setProjectError("Enter a monthly budget greater than zero.");
      return;
    }

    const project = buildProject(projectForm.name, monthlyBudget);

    writeProjectStore({
      projects: [project, ...store.projects],
      selectedProjectId: project.id,
    });
    setProjectForm(initialProjectForm);
    router.push(`/projects/${project.id}`);
  }

  function addExpense(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setExpenseError(null);

    if (!activeProject) {
      setExpenseError("Create or select a project before logging an expense.");
      return;
    }

    const amount = Number(expenseForm.amount);

    if (!expenseForm.name.trim()) {
      setExpenseError("Add an expense name.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setExpenseError("Enter an amount greater than zero.");
      return;
    }

    const expense = buildExpense(expenseForm.name, amount);

    writeProjectStore({
      ...store,
      selectedProjectId: activeProject.id,
      projects: store.projects.map((project) =>
        project.id === activeProject.id
          ? {
              ...project,
              expenses: [expense, ...project.expenses],
              updatedAt: expense.createdAt,
            }
          : project,
      ),
    });
    setExpenseForm(initialExpenseForm);
  }

  return (
    <main className="page-shell space-y-8">
      <header className="grid gap-6 rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(245,158,11,0.18),rgba(16,185,129,0.16))] p-6 shadow-[0_24px_80px_rgba(3,7,18,0.28)] md:grid-cols-[1.2fr_0.8fr] md:p-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-amber-100">
            Local-first finance tracker
          </div>
          <div className="space-y-3">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
              Build project budgets, watch spend, and keep everything in this browser.
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-slate-200 md:text-base">
              Create a finance project, switch between dashboards, and log expenses without
              touching a backend. Refreshes keep the current state because the workspace
              persists to local storage.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[1.4rem] border border-white/10 bg-slate-950/35 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Active projects</p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {portfolioSummary.activeProjects}
            </p>
          </div>
          <div className="rounded-[1.4rem] border border-white/10 bg-slate-950/35 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Portfolio budget</p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {formatCurrency(portfolioSummary.totalBudget)}
            </p>
          </div>
          <div className="rounded-[1.4rem] border border-white/10 bg-slate-950/35 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Logged spend</p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {formatCurrency(portfolioSummary.totalSpent)}
            </p>
          </div>
          <div className="rounded-[1.4rem] border border-white/10 bg-slate-950/35 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Remaining budget</p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {formatCurrency(portfolioSummary.remainingBudget)}
            </p>
          </div>
        </div>
      </header>

      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <aside className="space-y-6">
          <section className="panel-strong rounded-[1.8rem] p-6">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">
                Create project
              </p>
              <h2 className="text-2xl font-semibold text-white">Open a new budget workspace</h2>
            </div>

            <form className="mt-5 space-y-4" onSubmit={createProject}>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-200">Project name</span>
                <input
                  className="field"
                  onChange={(event) =>
                    setProjectForm((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="Q2 operating plan"
                  value={projectForm.name}
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-200">Monthly budget</span>
                <input
                  className="field"
                  inputMode="decimal"
                  onChange={(event) =>
                    setProjectForm((current) => ({
                      ...current,
                      monthlyBudget: event.target.value,
                    }))
                  }
                  placeholder="2500"
                  type="number"
                  value={projectForm.monthlyBudget}
                />
              </label>

              {projectError ? (
                <p className="rounded-2xl border border-rose-300/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                  {projectError}
                </p>
              ) : null}

              <button className="btn-primary w-full" type="submit">
                Save project locally
              </button>
            </form>
          </section>

          <section className="panel rounded-[1.8rem] p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-300">
                  Project list
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Saved dashboards</h2>
              </div>
              <span className="rounded-full border border-emerald-300/25 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">
                Local storage live
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {store.projects.map((project) => {
                const summary = getProjectSummary(project);
                const isActive = project.id === activeProject?.id;

                return (
                  <Link
                    key={project.id}
                    className={`block rounded-[1.4rem] border p-4 transition duration-150 ${
                      isActive
                        ? "border-amber-300/35 bg-amber-300/10"
                        : "border-white/8 bg-white/4 hover:border-emerald-300/25 hover:bg-white/7"
                    }`}
                    onClick={() =>
                      writeProjectStore({ ...store, selectedProjectId: project.id })
                    }
                    href={`/projects/${project.id}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                          Updated {formatShortDate(project.updatedAt)}
                        </p>
                      </div>
                      <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">
                        {summary.healthLabel}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                          Budget
                        </p>
                        <p className="mt-1 font-semibold text-white">
                          {formatCurrency(project.monthlyBudget)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                          Spent
                        </p>
                        <p className="mt-1 font-semibold text-white">
                          {formatCurrency(summary.spent)}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </aside>

        <div className="space-y-6">
          {selectedProjectMissing ? (
            <section className="rounded-[1.8rem] border border-amber-300/25 bg-amber-300/10 p-6 text-sm leading-7 text-amber-50">
              That project is not stored in this browser anymore. Choose another dashboard from
              the list to continue.
            </section>
          ) : null}

          {activeProject && activeSummary ? (
            <>
              <section className="panel-strong rounded-[1.9rem] p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">
                      Project dashboard
                    </div>
                    <div>
                      <h2 className="text-3xl font-semibold text-white">{activeProject.name}</h2>
                      <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
                        Track budget health, recent spend, and the expenses that are pushing this
                        project forward.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
                      {activeSummary.healthLabel}
                    </span>
                    <Link className="btn-secondary" href="/projects">
                      All projects
                    </Link>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-[1.4rem] border border-white/8 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Monthly budget
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {formatCurrency(activeProject.monthlyBudget)}
                    </p>
                  </div>
                  <div className="rounded-[1.4rem] border border-white/8 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Spent</p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {formatCurrency(activeSummary.spent)}
                    </p>
                  </div>
                  <div className="rounded-[1.4rem] border border-white/8 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Remaining
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {formatCurrency(activeSummary.remaining)}
                    </p>
                  </div>
                  <div className="rounded-[1.4rem] border border-white/8 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Expenses logged
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {activeSummary.expenseCount}
                    </p>
                  </div>
                </div>
              </section>

              <section className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
                <div className="panel rounded-[1.8rem] p-6">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">
                      Log expense
                    </p>
                    <h3 className="text-2xl font-semibold text-white">Add a new line item</h3>
                  </div>

                  <form className="mt-5 space-y-4" onSubmit={addExpense}>
                    <label className="block space-y-2">
                      <span className="text-sm font-semibold text-slate-200">Expense name</span>
                      <input
                        className="field"
                        onChange={(event) =>
                          setExpenseForm((current) => ({ ...current, name: event.target.value }))
                        }
                        placeholder="Contractor invoice"
                        value={expenseForm.name}
                      />
                    </label>

                    <label className="block space-y-2">
                      <span className="text-sm font-semibold text-slate-200">Amount</span>
                      <input
                        className="field"
                        inputMode="decimal"
                        onChange={(event) =>
                          setExpenseForm((current) => ({ ...current, amount: event.target.value }))
                        }
                        placeholder="180"
                        step="0.01"
                        type="number"
                        value={expenseForm.amount}
                      />
                    </label>

                    {expenseError ? (
                      <p className="rounded-2xl border border-rose-300/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                        {expenseError}
                      </p>
                    ) : null}

                    <button className="btn-primary w-full" type="submit">
                      Add expense
                    </button>
                  </form>
                </div>

                <div className="panel rounded-[1.8rem] p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-300">
                        Expense feed
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold text-white">
                        Recent project activity
                      </h3>
                    </div>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">
                      Updated {formatShortDate(activeProject.updatedAt)}
                    </span>
                  </div>

                  {activeProject.expenses.length > 0 ? (
                    <div className="mt-5 space-y-3">
                      {activeProject.expenses.map((expense) => (
                        <div
                          key={expense.id}
                          className="flex items-center justify-between gap-4 rounded-[1.4rem] border border-white/8 bg-white/4 px-4 py-4"
                        >
                          <div>
                            <p className="font-semibold text-white">{expense.name}</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">
                              Logged {formatShortDate(expense.createdAt)}
                            </p>
                          </div>
                          <p className="text-lg font-semibold text-emerald-200">
                            {formatCurrency(expense.amount)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-5 rounded-[1.4rem] border border-dashed border-white/12 bg-white/3 px-5 py-8 text-sm leading-7 text-slate-300">
                      No expenses yet. Add the first line item to turn this shell into a working
                      tracker.
                    </div>
                  )}
                </div>
              </section>
            </>
          ) : (
            <section className="panel rounded-[1.8rem] p-6">
              <h2 className="text-2xl font-semibold text-white">No project selected</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                Create a project from the left panel to seed the dashboard, then log expenses and
                track the remaining budget locally.
              </p>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
