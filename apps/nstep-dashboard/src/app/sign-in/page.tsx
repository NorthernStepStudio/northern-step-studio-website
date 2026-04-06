import Link from "next/link";
import { redirect } from "next/navigation";

import { readDashboardSessionFromCookies, buildLoginDestination } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SignInPage({
  searchParams,
}: Readonly<{
  searchParams?: Record<string, string | string[] | undefined>;
}>) {
  const session = await readDashboardSessionFromCookies();
  const nextPath = buildLoginDestination(typeof searchParams?.next === "string" ? searchParams.next : undefined);

  if (session) {
    redirect(nextPath);
  }

  const error = typeof searchParams?.error === "string" ? searchParams.error : undefined;

  return (
    <main className="nsos-auth-shell">
      <section className="nsos-auth-card">
        <div className="nsos-auth-mark">
          <span className="nsos-brand-kicker">NStepOS</span>
          <h1>Sign in to the operator console</h1>
          <p>Use your staging dashboard credentials to access workflow jobs, approvals, memory, and logs.</p>
        </div>

        {error === "invalid" ? (
          <div className="error-banner" role="alert">
            Invalid username or password.
          </div>
        ) : null}

        <form className="nsos-auth-form" method="post" action="/api/auth/login">
          <label className="field">
            <span className="field-label">Username</span>
            <input name="username" type="text" autoComplete="username" required />
          </label>

          <label className="field">
            <span className="field-label">Password</span>
            <input name="password" type="password" autoComplete="current-password" required />
          </label>

          <input name="next" type="hidden" value={nextPath} />

          <div className="form-actions">
            <button className="button button-primary" type="submit">
              Sign in
            </button>
            <Link className="button button-secondary" href="/">
              Go home
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
