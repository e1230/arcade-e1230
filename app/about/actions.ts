"use server";

import { Resend } from "resend";
import { buildContactEmail } from "@/lib/contact-email";
import type { ContactInput, ContactResult } from "@/lib/contact";
import { validateContact } from "@/lib/contact";

const DEFAULT_FROM_EMAIL = "Arcade E1230 <onboarding@resend.dev>";

// La acción trata `input` como no confiable, aunque el tipo lo declare `ContactInput`:
// se puede invocar sin pasar por la UI, sin las garantías del compilador.
export async function sendContactMessage(input: ContactInput): Promise<ContactResult> {
  const untrusted = input as unknown;
  if (
    typeof untrusted !== "object" ||
    untrusted === null ||
    typeof (untrusted as Record<string, unknown>).name !== "string" ||
    typeof (untrusted as Record<string, unknown>).email !== "string" ||
    typeof (untrusted as Record<string, unknown>).message !== "string" ||
    typeof (untrusted as Record<string, unknown>).website !== "string"
  ) {
    return { status: "error", code: "invalid" };
  }

  if (input.website.trim() !== "") {
    return { status: "success" };
  }

  const name = input.name.trim();
  const email = input.email.trim();
  const message = input.message.trim();
  const invalidFields = validateContact({ name, email, message, website: "" });
  if (invalidFields.length > 0) {
    return { status: "error", code: "invalid" };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  if (!apiKey) {
    console.error("Falta la variable de entorno RESEND_API_KEY");
    return { status: "error", code: "config" };
  }
  if (!toEmail) {
    console.error("Falta la variable de entorno CONTACT_TO_EMAIL");
    return { status: "error", code: "config" };
  }

  const fromEmail = process.env.CONTACT_FROM_EMAIL || DEFAULT_FROM_EMAIL;
  const contactEmail = buildContactEmail({ name, email, message });

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: email,
      subject: contactEmail.subject,
      text: contactEmail.text,
      html: contactEmail.html,
    });

    if (error) {
      console.error(`Resend devolvió un error (${error.name}): ${error.message}`);
      return { status: "error", code: "send" };
    }

    return { status: "success" };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`La llamada a Resend lanzó una excepción: ${errorMessage}`);
    return { status: "error", code: "send" };
  }
}
