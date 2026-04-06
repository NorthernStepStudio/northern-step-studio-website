import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-shell">
      <section className="panel-strong mx-auto max-w-3xl rounded-[2rem] p-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
          Page not found
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-white">
          NSS DevOS could not find that page.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300">
          Go back to the project dashboard and open the current task or run from there.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link className="btn-primary" href="/projects">
            Open projects
          </Link>
          <Link className="btn-secondary" href="/">
            Go home
          </Link>
        </div>
      </section>
    </main>
  );
}
