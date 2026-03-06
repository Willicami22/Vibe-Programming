import { cookies } from "next/headers";
import { randomUUID } from "crypto";

const SESSION_COOKIE_NAME = "ecotrack_session_id";
const SESSION_MAX_AGE = 60 * 60 * 24 * 365; // 1 año

/**
 * Obtiene el sessionId de la cookie o undefined si no existe.
 */
export async function getSessionId(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

/**
 * Devuelve el sessionId existente o crea uno nuevo y lo guarda en cookie.
 * Usar desde API routes que necesiten asegurar una sesión (ej. POST /api/analyze).
 */
export async function getOrCreateSessionId(): Promise<string> {
  const existing = await getSessionId();
  if (existing) return existing;

  const newId = randomUUID();
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, newId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
  });
  return newId;
}
