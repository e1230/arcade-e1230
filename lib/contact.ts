export interface ContactInput {
  name: string;
  email: string;
  message: string;
  website: string;
}

export type ContactFieldName = "name" | "email" | "message";

export const CONTACT_LIMITS: Record<ContactFieldName, number> = {
  name: 60,
  email: 254,
  message: 2000,
};

export const EMPTY_CONTACT: ContactInput = { name: "", email: "", message: "", website: "" };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Devuelve los campos inválidos en orden (name, email, message); [] si todo es válido
export function validateContact(input: ContactInput): ContactFieldName[] {
  const invalid: ContactFieldName[] = [];

  const name = input.name.trim();
  if (!name || name.length > CONTACT_LIMITS.name) invalid.push("name");

  const email = input.email.trim();
  if (!email || email.length > CONTACT_LIMITS.email || !EMAIL_PATTERN.test(email)) {
    invalid.push("email");
  }

  const message = input.message.trim();
  if (!message || message.length > CONTACT_LIMITS.message) invalid.push("message");

  return invalid;
}

export type ContactErrorCode = "invalid" | "config" | "send";

export type ContactResult = { status: "success" } | { status: "error"; code: ContactErrorCode };
