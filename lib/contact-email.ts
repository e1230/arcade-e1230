import type { ContactInput } from "@/lib/contact";

export interface ContactEmail {
  subject: string;
  text: string;
  html: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildContactEmail(
  input: Pick<ContactInput, "name" | "email" | "message">,
): ContactEmail {
  const { name, email, message } = input;
  const subjectName = name.replace(/[\r\n]+/g, " ");

  return {
    subject: `[Arcade E1230] Nuevo mensaje de ${subjectName}`,
    text: `Nombre: ${name}\nCorreo: ${email}\n\n${message}`,
    html: `<p><strong>Nombre:</strong> ${escapeHtml(name)}</p><p><strong>Correo:</strong> ${escapeHtml(email)}</p><p style="white-space: pre-wrap">${escapeHtml(message)}</p>`,
  };
}
