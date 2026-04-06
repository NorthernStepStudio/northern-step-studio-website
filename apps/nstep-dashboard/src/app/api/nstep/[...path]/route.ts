import { getBackendUrl } from "../../../../lib/backend";
import { getDashboardAuthHeaders, getDashboardSessionFromRequest } from "../../../../lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    path?: string[];
  }>;
};

async function proxy(request: Request, context: RouteContext): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: commonHeaders(),
    });
  }

  const { path = [] } = await context.params;
  const target = new URL(path.join("/"), getBackendUrl("/"));
  target.search = new URL(request.url).search;
  const session = getDashboardSessionFromRequest(request);
  if (!session) {
    return Response.json(
      { error: { message: "Dashboard session is required." } },
      {
        status: 401,
        headers: commonHeaders(),
      },
    );
  }

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");
  headers.delete("accept-encoding");
  headers.delete("authorization");
  headers.delete("cookie");
  headers.delete("x-nstep-actor-id");
  headers.delete("x-nstep-actor-name");
  headers.delete("x-nstep-role");
  headers.delete("x-nstep-tenant-id");

  const trustedHeaders = getDashboardAuthHeaders(session);
  for (const [key, value] of trustedHeaders.entries()) {
    headers.set(key, value);
  }

  const init: RequestInit = {
    method: request.method,
    headers,
    cache: "no-store",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  try {
    const response = await fetch(target, init);
    const responseHeaders = new Headers(response.headers);
    for (const [key, value] of Object.entries(commonHeaders())) {
      responseHeaders.set(key, value);
    }
    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    return Response.json(
      {
        error: {
          message: error instanceof Error ? error.message : "NStepOS backend is unavailable.",
        },
      },
      {
        status: 502,
        headers: commonHeaders(),
      },
    );
  }
}

function commonHeaders(): Record<string, string> {
  return {
    "cache-control": "no-store",
    "x-nstep-dashboard-proxy": "true",
  };
}

export async function GET(request: Request, context: RouteContext): Promise<Response> {
  return proxy(request, context);
}

export async function POST(request: Request, context: RouteContext): Promise<Response> {
  return proxy(request, context);
}

export async function PUT(request: Request, context: RouteContext): Promise<Response> {
  return proxy(request, context);
}

export async function PATCH(request: Request, context: RouteContext): Promise<Response> {
  return proxy(request, context);
}

export async function DELETE(request: Request, context: RouteContext): Promise<Response> {
  return proxy(request, context);
}

export async function OPTIONS(request: Request, context: RouteContext): Promise<Response> {
  return proxy(request, context);
}
