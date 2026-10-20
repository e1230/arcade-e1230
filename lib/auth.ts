// Validación y mensajes de autenticación compartidos por el servidor y el navegador.
// No importa clientes de Supabase, así lo pueden usar Server Actions y componentes cliente.

export const ALIAS_PATTERN = /^[A-Z0-9_]{3,14}$/;
export const ALIAS_MAX_LENGTH = 14;
export const PASSWORD_MIN_LENGTH = 8;
export const EMAIL_MAX_LENGTH = 254;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeAlias(input: string): string {
  return input.trim().toUpperCase();
}

export function isValidAlias(alias: string): boolean {
  return ALIAS_PATTERN.test(alias);
}

export function isValidEmail(email: string): boolean {
  return email.length <= EMAIL_MAX_LENGTH && EMAIL_PATTERN.test(email);
}

export function isValidPassword(password: string): boolean {
  return password.length >= PASSWORD_MIN_LENGTH;
}

// Mensajes de cada campo, mostrados antes de enviar el formulario
export const FIELD_MESSAGES = {
  alias: "El alias debe tener de 3 a 14 caracteres: letras, números o _.",
  email: "Ingresa un correo electrónico válido.",
  password: `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`,
  passwordMismatch: "Las contraseñas no coinciden.",
} as const;

export type AuthErrorCode =
  | "invalid" // datos que no pasan la validación
  | "credentials" // correo o contraseña incorrectos
  | "email_taken" // ya existe una cuenta con ese correo
  | "alias_taken" // el alias ya está en uso
  | "weak_password" // menos de 8 caracteres
  | "rate_limit" // demasiados intentos o correos
  | "unavailable"; // faltan variables o Supabase no responde

export type AuthResult =
  { status: "success" } | { status: "error"; code: AuthErrorCode };

export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  invalid: "Revisa los datos del formulario.",
  credentials: "Correo o contraseña incorrectos.",
  email_taken: "Ya existe una cuenta con ese correo.",
  alias_taken: "Ese alias ya está en uso. Prueba con otro.",
  weak_password: FIELD_MESSAGES.password,
  rate_limit: "Demasiados intentos. Espera unos minutos e intenta de nuevo.",
  unavailable: "No pudimos conectar con el servidor. Intenta de nuevo.",
};

// Fallo de Google o GitHub, también el de /login?error=oauth
export const OAUTH_ERROR_MESSAGE =
  "No pudimos iniciar sesión con ese proveedor. Intenta de nuevo.";
