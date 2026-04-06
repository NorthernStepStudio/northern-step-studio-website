import Link from "next/link";

import { NewProjectForm } from "@/components/new-project-form";

export const dynamic = "force-dynamic";

export default function NewProjectPage() {
  return (
    <main className="page-shell space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
            New project brief
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-white">
            Create a structured spec, milestone one, and the first task packet.
          </h1>
        </div>
        <Link className="btn-secondary" href="/projects">
          Back to projects
        </Link>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="panel-strong rounded-[2rem] p-6 md:p-8">
          <NewProjectForm />
        </div>

        <aside className="space-y-6">
          <div className="panel rounded-[1.8rem] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-300">
              Planning output
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
              <li>Normalize the raw brief into a structured product spec.</li>
              <li>Create milestone one automatically for the supervised build loop.</li>
              <li>Generate the first task packet with acceptance criteria and file boundaries.</li>
            </ul>
          </div>

          <div className="panel rounded-[1.8rem] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">
              Command format
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              One command per line using:
            </p>
            <pre className="mt-4 overflow-x-auto rounded-2xl border border-white/8 bg-slate-950/80 p-4 text-sm text-slate-200">
              <code>{`typecheck | npm run lint
build | npm run build
test | npm run test`}</code>
            </pre>
          </div>
        </aside>
      </section>
    </main>
  );
}
