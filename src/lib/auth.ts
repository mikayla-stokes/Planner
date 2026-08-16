import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "session";
const SESSION_PAYLOAD = "life-planner-authenticated";

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret === "changeme-generate-a-real-random-secret") {
    throw new Error(
      "SESSION_SECRET is not set to a real value. Generate one with `openssl rand -hex 32` and put it in .env.",
    );
  }
  return secret;
}

function expectedToken(): string {
  return createHmac("sha256", getSecret()).update(SESSION_PAYLOAD).digest("hex");
}

export function checkPassword(candidate: string): boolean {
  const expected = process.env.APP_PASSWORD ?? "";
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function createSession() {
  const store = await cookies();
  store.set(COOKIE_NAME, expectedToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90, // 90 days — this is a shared household login, not a bank
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(expectedToken());
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
