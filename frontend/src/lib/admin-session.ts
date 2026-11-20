import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "cscskb_admin_session";
const SESSION_SECONDS = 8 * 60 * 60;

type SessionPayload = { sub: string; role: "owner_admin"; iat: number; exp: number };

function secret() {
  const value = process.env.CSCSKB_ADMIN_SESSION_SECRET || "";
  if (value.length < 32) throw new Error("CSCSKB_ADMIN_SESSION_SECRET must be at least 32 characters.");
  return value;
}

function signature(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function verifyAdminPassword(candidate: string) {
  const expected = process.env.CSCSKB_ADMIN_PASSWORD || "";
  if (expected.length < 16 || candidate.length < 1) return false;
  return safeEqual(candidate, expected);
}

export function createAdminSessionToken() {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    sub: process.env.CSCSKB_ADMIN_ID || "primary-owner",
    role: "owner_admin",
    iat: now,
    exp: now + SESSION_SECONDS,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${signature(encoded)}`;
}

export function verifyAdminSessionCookie(value?: string): SessionPayload | null {
  if (!value) return null;
  const [encoded, suppliedSignature, extra] = value.split(".");
  if (!encoded || !suppliedSignature || extra) return null;
  try {
    if (!safeEqual(signature(encoded), suppliedSignature)) return null;
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SessionPayload;
    const now = Math.floor(Date.now() / 1000);
    if (payload.role !== "owner_admin" || !payload.sub || !Number.isInteger(payload.exp) || payload.exp <= now) return null;
    return payload;
  } catch {
    return null;
  }
}

export const ADMIN_SESSION_MAX_AGE = SESSION_SECONDS;
