import type { IncomingMessage, ServerResponse } from "node:http";

import { startNStepOsServer } from "../src/server.js";
import type { StartedServer } from "../src/server.js";

let startedServerPromise: Promise<StartedServer> | null = null;

async function getStartedServer(): Promise<StartedServer> {
  if (!startedServerPromise) {
    startedServerPromise = startNStepOsServer();
  }
  return startedServerPromise;
}

export const config = {
  runtime: "nodejs",
};

export default async function handler(request: IncomingMessage, response: ServerResponse): Promise<void> {
  const startedServer = await getStartedServer();
  const incomingUrl = new URL(request.url || "/", `http://${request.headers.host || `127.0.0.1:${startedServer.port}`}`);
  const targetPath = incomingUrl.pathname.startsWith("/api") ? incomingUrl.pathname.slice(4) || "/" : incomingUrl.pathname;
  const targetUrl = new URL(targetPath, `http://127.0.0.1:${startedServer.port}`);
  targetUrl.search = incomingUrl.search;

  const headers = new Headers();
  for (const [key, value] of Object.entries(request.headers)) {
    if (value === undefined) {
      continue;
    }
    if (Array.isArray(value)) {
      headers.set(key, value.join(","));
      continue;
    }
    headers.set(key, value);
  }
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");
  headers.delete("accept-encoding");
  headers.delete("cookie");

  const method = String(request.method || "GET").toUpperCase();
  const init: RequestInit = {
    method,
    headers,
    cache: "no-store",
  };
  if (method !== "GET" && method !== "HEAD") {
    init.body = await readNodeRequestBody(request);
  }

  const proxiedResponse = await fetch(targetUrl, init);
  response.statusCode = proxiedResponse.status;
  for (const [key, value] of proxiedResponse.headers.entries()) {
    response.setHeader(key, value);
  }
  const buffer = Buffer.from(await proxiedResponse.arrayBuffer());
  response.end(buffer);
}

async function readNodeRequestBody(request: IncomingMessage): Promise<ArrayBuffer | undefined> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  if (chunks.length === 0) {
    return undefined;
  }
  const buffer = Buffer.concat(chunks);
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}
