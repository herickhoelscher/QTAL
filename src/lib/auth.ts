import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { AdminRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE = "portal_session";
const MAX_AGE = 60 * 60 * 8; // 8 horas
/** "Lembrar de mim" marcado no login. */
const REMEMBER_MAX_AGE = 60 * 60 * 24 * 30; // 30 dias

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
};

function secret(): Uint8Array {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET nao configurado");
  return new TextEncoder().encode(value);
}

export async function createSession(
  user: SessionUser,
  { remember = false }: { remember?: boolean } = {},
): Promise<void> {
  const maxAge = remember ? REMEMBER_MAX_AGE : MAX_AGE;
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${maxAge}s`)
    .sign(secret());

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      id: String(payload.id),
      name: String(payload.name),
      email: String(payload.email),
      role: payload.role as AdminRole,
    };
  } catch {
    return null;
  }
}

/** Usado por todo layout/acao do painel: sem sessao valida, nada executa. */
export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  const user = await prisma.adminUser.findUnique({ where: { id: session.id } });
  if (!user || !user.active) throw new Error("UNAUTHORIZED");
  return session;
}

export async function requireAdmin(): Promise<SessionUser> {
  const session = await requireSession();
  if (session.role !== "ADMIN") throw new Error("FORBIDDEN");
  return session;
}
