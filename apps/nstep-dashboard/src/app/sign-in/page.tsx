import { redirect } from "next/navigation";

import { buildLoginDestination, resolveDashboardAdminLoginUrl } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SignInPage({
  searchParams,
}: Readonly<{
  searchParams?:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>;
}>) {
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});
  const nextPath = buildLoginDestination(
    typeof resolvedSearchParams.next === "string" ? resolvedSearchParams.next : undefined,
  );

  const loginUrl = new URL(resolveDashboardAdminLoginUrl());
  loginUrl.searchParams.set("dashboard", nextPath);

  redirect(loginUrl.toString());
}
