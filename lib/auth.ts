// Validación y mensajes de autenticación compartidos por el servidor y el navegador.
// No importa clientes de Supabase, así lo pueden usar Server Actions y componentes cliente.

export const ALIAS_PATTERN = /^[A-Z0-9_]{3,14}$/;
export const ALIAS_MAX_LENGTH = 14;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_BYTES = 72; // límite real de bcrypt
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

// bcrypt solo usa los primeros 72 bytes: se cuenta en bytes UTF-8 para que una contraseña
// con acentos o emojis no se trunque sin avisar. Quien valida una contraseña nueva llama
// a isValidPassword y a esta función.
export function isPasswordTooLong(password: string): boolean {
  return new TextEncoder().encode(password).length > PASSWORD_MAX_BYTES;
}

// Mensajes de cada campo, mostrados antes de enviar el formulario
export const FIELD_MESSAGES = {
  alias: "El alias debe tener de 3 a 14 caracteres: letras, números o _.",
  email: "Ingresa un correo electrónico válido.",
  password: `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`,
  passwordMax: `La contraseña no puede pasar de ${PASSWORD_MAX_BYTES} bytes (unos ${PASSWORD_MAX_BYTES} caracteres; menos si usas acentos o emojis).`,
  passwordMismatch: "Las contraseñas no coinciden.",
} as const;

export type AuthErrorCode =
  | "invalid" // datos que no pasan la validación
  | "credentials" // correo o contraseña incorrectos
  | "email_taken" // ya existe una cuenta con ese correo
  | "alias_taken" // el alias ya está en uso
  | "weak_password" // menos de 8 caracteres
  | "password_too_long" // más de 72 bytes
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
  password_too_long: FIELD_MESSAGES.passwordMax,
  rate_limit: "Demasiados intentos. Espera unos minutos e intenta de nuevo.",
  unavailable: "No pudimos conectar con el servidor. Intenta de nuevo.",
};

// Fallo de Google o GitHub, también el de /login?error=oauth
export const OAUTH_ERROR_MESSAGE =
  "No pudimos iniciar sesión con ese proveedor. Intenta de nuevo.";

// Enlace de recuperación inválido, usado o abierto en otro navegador (/login?error=link)
export const LINK_ERROR_MESSAGE =
  "El enlace no es válido o ya expiró. Pide uno nuevo.";
