"use server";

import type { AuthError, SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  type AuthErrorCode,
  type AuthResult,
  isValidAlias,
  isValidEmail,
  isValidPassword,
  normalizeAlias,
} from "@/lib/auth";
import { safeNextPath } from "@/lib/safe-next";
import { readSiteUrl } from "@/lib/site-url";
import type { Database } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

// Las acciones se pueden invocar sin pasar por la UI: la entrada se trata como no confiable
// y solo se aceptan las claves esperadas, todas como string.
function readStrings<K extends string>(
  input: unknown,
  keys: readonly K[],
): Record<K, string> | null {
  if (typeof input !== "object" || input === null) return null;
  const record = input as Record<string, unknown>;
  const result = {} as Record<K, string>;
  for (const key of keys) {
    const value = record[key];
    if (typeof value !== "string") return null;
    result[key] = value;
  }
  return result;
}

function fail(code: AuthErrorCode): AuthResult {
  return { status: "error", code };
}

// Traduce los errores de Supabase Auth a los códigos de la app
function toAuthErrorCode(error: AuthError): AuthErrorCode {
  switch (error.code) {
    case "invalid_credentials":
      return "credentials";
    case "user_already_exists":
    case "email_exists":
      return "email_taken";
    case "weak_password":
      return "weak_password";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "rate_limit";
    case "validation_failed":
    case "email_address_invalid":
    case "same_password": // la contraseña nueva es igual a la anterior
      return "invalid";
    default:
      return "unavailable";
  }
}

async function hasProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();
  return data !== null;
}

// Con perfil se vuelve a next; sin perfil se pasa antes por «ELIGE TU ALIAS»
function destinationFor(withProfile: boolean, next: string): string {
  return withProfile ? next : `/onboarding?next=${encodeURIComponent(next)}`;
}

export async function signInWithPassword(input: {
  email: string;
  password: string;
  next: string;
}): Promise<AuthResult> {
  const fields = readStrings(input, ["email", "password", "next"] as const);
  if (!fields) return fail("invalid");
  const email = fields.email.trim();
  if (!isValidEmail(email) || !fields.password) return fail("invalid");
  const next = safeNextPath(fields.next);

  let destination: string;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: fields.password,
    });
    if (error) return fail(toAuthErrorCode(error));
    destination = destinationFor(
      await hasProfile(supabase, data.user.id),
      next,
    );
  } catch {
    // createClient lanza si faltan las variables de Supabase
    return fail("unavailable");
  }

  // redirect lanza NEXT_REDIRECT: va fuera del try para que el catch no lo atrape
  redirect(destination);
}

export async function signUp(input: {
  alias: string;
  email: string;
  password: string;
  next: string;
}): Promise<AuthResult> {
  const fields = readStrings(input, [
    "alias",
    "email",
    "password",
    "next",
  ] as const);
  if (!fields) return fail("invalid");
  const alias = normalizeAlias(fields.alias);
  const email = fields.email.trim();
  if (!isValidAlias(alias) || !isValidEmail(email)) return fail("invalid");
  if (!isValidPassword(fields.password)) return fail("weak_password");
  const next = safeNextPath(fields.next);

  let destination: string;
  try {
    const supabase = await createClient();

    // Comprobación previa para dar un mensaje claro; la carrera entre dos registros
    // simultáneos la resuelve el `on conflict` del trigger handle_new_user
    const { data: taken, error: lookupError } = await supabase
      .from("profiles")
      .select("id")
      .eq("alias", alias)
      .maybeSingle();
    if (lookupError) return fail("unavailable");
    if (taken) return fail("alias_taken");

    const { data, error } = await supabase.auth.signUp({
      email,
      password: fields.password,
      options: { data: { alias } },
    });
    if (error) return fail(toAuthErrorCode(error));
    // Sin confirmación de correo, signUp devuelve la sesión. Si no la trae, el correo ya existía
    // (Supabase oculta ese caso para no revelar cuentas) o la confirmación sigue activa.
    if (!data.user || !data.session) return fail("email_taken");
    destination = destinationFor(
      await hasProfile(supabase, data.user.id),
      next,
    );
  } catch {
    return fail("unavailable");
  }

  redirect(destination);
}

export async function chooseAlias(input: {
  alias: string;
  next: string;
}): Promise<AuthResult> {
  const fields = readStrings(input, ["alias", "next"] as const);
  if (!fields) return fail("invalid");
  const alias = normalizeAlias(fields.alias);
  if (!isValidAlias(alias)) return fail("invalid");
  const next = safeNextPath(fields.next);

  let destination = next;
  try {
    const supabase = await createClient();
    const { data: claims } = await supabase.auth.getClaims();
    const userId = claims?.claims.sub;
    if (!userId) {
      // La sesión expiró mientras elegía el alias: se inicia sesión y se vuelve a /onboarding
      const onboarding = `/onboarding?next=${encodeURIComponent(next)}`;
      destination = `/login?next=${encodeURIComponent(onboarding)}`;
    } else {
      const { error } = await supabase
        .from("profiles")
        .insert({ id: userId, alias });
      if (error) {
        if (error.code !== "23505") return fail("unavailable");
        // 23505 en la clave primaria: la cuenta ya tenía alias, se sigue a next
        if (!error.message.includes("profiles_pkey"))
          return fail("alias_taken");
      }
      // Insertar el perfil no toca cookies, así que Next reutilizaría el layout ya
      // pintado (Navbar con «ELIGE TU ALIAS»): se invalida para que lea el alias nuevo
      revalidatePath("/", "layout");
    }
  } catch {
    return fail("unavailable");
  }

  redirect(destination);
}

// Origen de respaldo del correo de recuperación cuando falta NEXT_PUBLIC_SITE_URL en desarrollo
const DEV_SITE_URL = "http://localhost:3000";

// Ruta a la que vuelve el enlace del correo de recuperación (plantilla por defecto de Supabase)
const RECOVERY_CALLBACK = "/auth/callback?type=recovery&next=%2Fauth%2Freset";

export async function requestPasswordReset(input: {
  email: string;
}): Promise<AuthResult> {
  const fields = readStrings(input, ["email"] as const);
  if (!fields) return fail("invalid");
  const email = fields.email.trim();
  if (!isValidEmail(email)) return fail("invalid");

  try {
    // El enlace vuelve al origen fijo del sitio, nunca al de la cabecera Origin (la controla
    // quien llame la acción). Sin la variable, en desarrollo se usa localhost:3000 y en
    // producción no se envía el correo.
    const origin =
      readSiteUrl() ??
      (process.env.NODE_ENV === "production" ? null : DEV_SITE_URL);
    if (!origin) return fail("unavailable");

    const supabase = await createClient();
    // El verificador PKCE queda en una cookie que escribe esta acción: el enlace
    // solo funciona en el navegador donde se pidió
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}${RECOVERY_CALLBACK}`,
    });
    if (error) {
      const code = toAuthErrorCode(error);
      // Solo se informan los errores que no revelan si el correo tiene cuenta
      if (code === "rate_limit" || code === "invalid") return fail(code);
      if (code === "unavailable") return fail("unavailable");
    }
  } catch {
    return fail("unavailable");
  }

  return { status: "success" };
}

export async function updatePassword(input: {
  password: string;
}): Promise<AuthResult> {
  const fields = readStrings(input, ["password"] as const);
  if (!fields) return fail("invalid");
  if (!isValidPassword(fields.password)) return fail("weak_password");

  let destination = "/";
  try {
    const supabase = await createClient();
    const { data: claims } = await supabase.auth.getClaims();
    if (!claims) {
      // La sesión de recuperación expiró: hay que pedir otro enlace
      destination = "/login?error=link";
    } else {
      const { error } = await supabase.auth.updateUser({
        password: fields.password,
      });
      if (error) return fail(toAuthErrorCode(error));
    }
  } catch {
    return fail("unavailable");
  }

  redirect(destination);
}

export async function signOut(): Promise<void> {
  try {
    const supabase = await createClient();
    // scope local: cierra la sesión de este navegador y deja las de otros dispositivos
    await supabase.auth.signOut({ scope: "local" });
  } catch {
    // Sin variables de Supabase no hay sesión que cerrar
  }
}
