import crypto from "node:crypto";
import type { IncomingMessage } from "node:http";

import type { RuntimeConfig } from "./types.js";

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function timingSafeBearerMatch(expected: string, actual: string): boolean {
  return safeEqual(expected, actual);
}

export interface InternalRequestCheck {
  readonly allowed: boolean;
  readonly reason?: string;
}

export function verifyInternalRequest(request: IncomingMessage, config: RuntimeConfig): InternalRequestCheck {
  const internalToken = config.auth?.internalToken?.trim();
  if (!internalToken) {
    return { allowed: process.env.NODE_ENV !== "production" };
  }

  const authorization = String(request.headers.authorization || "").trim();
  if (!authorization.toLowerCase().startsWith("bearer ")) {
    return {
      allowed: false,
      reason: "Missing internal authorization token.",
    };
  }

  const supplied = authorization.slice(7).trim();
  if (!supplied || !timingSafeBearerMatch(internalToken, supplied)) {
    return {
      allowed: false,
      reason: "Invalid internal authorization token.",
    };
  }

  return { allowed: true };
}

export interface TwilioRequestCheck {
  readonly allowed: boolean;
  readonly reason?: string;
}

export function verifyTwilioRequest(
  request: IncomingMessage,
  rawBody: string,
  config: RuntimeConfig,
): TwilioRequestCheck {
  const authToken = config.twilio?.authToken?.trim();
  if (!authToken) {
    if (process.env.NODE_ENV !== "production") {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: "Twilio auth token is not configured.",
    };
  }

  const suppliedSignature = String(request.headers["x-twilio-signature"] || "").trim();
  if (!suppliedSignature) {
    return {
      allowed: false,
      reason: "Missing Twilio signature.",
    };
  }

  const url = buildPublicWebhookUrl(request);
  const expected = buildTwilioSignature(url, rawBody, authToken, request.headers["content-type"]);
  if (!safeEqual(suppliedSignature, expected)) {
    return {
      allowed: false,
      reason: "Invalid Twilio signature.",
    };
  }

  return { allowed: true };
}

function buildPublicWebhookUrl(request: IncomingMessage): string {
  const protocolHeader = String(request.headers["x-forwarded-proto"] || "http").split(",")[0].trim() || "http";
  const host = String(request.headers.host || request.headers["x-forwarded-host"] || "localhost").split(",")[0].trim();
  const path = request.url || "/";
  return `${protocolHeader}://${host}${path}`;
}

function buildTwilioSignature(url: string, rawBody: string, authToken: string, contentType: string | string[] | undefined): string {
  const normalizedType = Array.isArray(contentType) ? contentType.join(",") : String(contentType || "").toLowerCase();
  const body = rawBody.trim();

  if (!body) {
    return crypto.createHmac("sha1", authToken).update(url).digest("base64");
  }

  if (normalizedType.includes("application/x-www-form-urlencoded")) {
    const params = new URLSearchParams(body);
    const keys = Array.from(params.keys()).sort();
    const base = keys.reduce((accumulator, key) => `${accumulator}${key}${params.getAll(key).join("")}`, url);
    return crypto.createHmac("sha1", authToken).update(base).digest("base64");
  }

  return crypto.createHmac("sha1", authToken).update(`${url}${body}`).digest("base64");
}
