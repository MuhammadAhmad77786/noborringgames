import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function clientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown"
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export function isEmail(v: unknown): v is string {
  return typeof v === "string" && v.length <= 200 && EMAIL_RE.test(v.trim());
}

export function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

/**
 * Best-effort in-memory rate limiter (per server instance). Good enough to
 * slow down form spam; put a WAF / Vercel firewall rule in front for more.
 */
const buckets = new Map<string, { count: number; reset: number }>();
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    if (buckets.size > 5000) {
      for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
    }
    return true;
  }
  b.count++;
  return b.count <= limit;
}

function downloadSecret() {
  const s = process.env.DOWNLOAD_SECRET || process.env.REVALIDATE_SECRET;
  if (!s) throw new Error("DOWNLOAD_SECRET or REVALIDATE_SECRET must be set");
  return s;
}

/** Signed, expiring token that unlocks an email-gated printable. */
export function signDownload(postId: string, printableId: string, ttlSeconds = 60 * 60 * 24 * 7): string {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const sig = createHmac("sha256", downloadSecret()).update(`${postId}:${printableId}:${exp}`).digest("base64url");
  return `${exp}.${sig}`;
}

export function verifyDownload(postId: string, printableId: string, token: string | null): boolean {
  if (!token) return false;
  const [expStr, sig] = token.split(".");
  const exp = Number(expStr);
  if (!exp || !sig || exp < Date.now() / 1000) return false;
  const expected = createHmac("sha256", downloadSecret()).update(`${postId}:${printableId}:${exp}`).digest();
  const given = Buffer.from(sig, "base64url");
  return given.length === expected.length && timingSafeEqual(given, expected);
}
