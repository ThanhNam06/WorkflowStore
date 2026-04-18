import { createHmac, timingSafeEqual } from "node:crypto";

export function verifySepayAuthorization(authHeader: string | null, secret: string): boolean {
  if (!authHeader || !secret) return false;
  const expected = `apikey ${secret}`.toLowerCase();
  return authHeader.trim().toLowerCase() === expected;
}

export function normalizeProviderTxnId(value: string | undefined | null) {
  if (!value) return "";
  return String(value).trim();
}

export function safeEqual(a: string, b: string) {
  const aa = Buffer.from(a);
  const bb = Buffer.from(b);
  if (aa.length !== bb.length) return false;
  return timingSafeEqual(aa, bb);
}

export function hmacSha256Hex(secret: string, data: string) {
  return createHmac("sha256", secret).update(data).digest("hex");
}
