"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { sendContactMessage } from "@/app/about/actions";
import { ContactField } from "@/components/about/ContactField";
import { ContactTerminal } from "@/components/about/ContactTerminal";
import { NeonButton } from "@/components/ui/NeonButton";
import {
  CONTACT_LIMITS,
  EMPTY_CONTACT,
  validateContact,
  type ContactFieldName,
  type ContactInput,
  type ContactResult,
} from "@/lib/contact";

const SHAKE_DURATION_MS = 400;

export function ContactForm() {
  const [values, setValues] = useState<ContactInput>(EMPTY_CONTACT);
  const [invalid, setInvalid] = useState<ContactFieldName[]>([]);
  const [shake, setShake] = useState(false);
  const [result, setResult] = useState<ContactResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const shakeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (shakeTimeout.current) clearTimeout(shakeTimeout.current);
    };
  }, []);

  const updateField = (field: ContactFieldName, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setInvalid((prev) => prev.filter((name) => name !== field));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const invalidFields = validateContact(values);

    if (invalidFields.length > 0) {
      setInvalid(invalidFields);
      setShake(true);
      if (shakeTimeout.current) clearTimeout(shakeTimeout.current);
      shakeTimeout.current = setTimeout(() => setShake(false), SHAKE_DURATION_MS);
      return;
    }

    startTransition(async () => {
      let outcome: ContactResult;
      try {
        outcome = await sendContactMessage(values);
      } catch {
        outcome = { status: "error", code: "send" };
      }
      startTransition(() => {
        setResult(outcome);
      });
    });
  };

  const handleRetry = () => {
    setResult(null);
  };

  const handleReset = () => {
    setResult(null);
    setValues(EMPTY_CONTACT);
    setInvalid([]);
  };

  const playerName = values.name.trim().toUpperCase();

  return (
    <div
      className={`relative border border-border-neon bg-surface p-7 transition-transform duration-75 before:pointer-events-none before:absolute before:inset-1 before:border before:border-dashed before:border-cyan/15 ${
        shake ? "motion-safe:animate-shake" : ""
      }`}
    >
      {result ? (
        <ContactTerminal
          result={result}
          playerName={playerName}
          onReset={result.status === "success" ? handleReset : handleRetry}
        />
      ) : (
        <form noValidate onSubmit={handleSubmit}>
          <ContactField
            label="NOMBRE"
            name="name"
            value={values.name}
            onChange={(value) => updateField("name", value)}
            placeholder="px_kai"
            maxLength={CONTACT_LIMITS.name}
            disabled={isPending}
            invalid={invalid.includes("name")}
          />
          <ContactField
            label="CORREO ELECTRÓNICO"
            name="email"
            type="email"
            value={values.email}
            onChange={(value) => updateField("email", value)}
            placeholder="jugador@email.gg"
            maxLength={CONTACT_LIMITS.email}
            disabled={isPending}
            invalid={invalid.includes("email")}
          />
          <ContactField
            label="MENSAJE"
            name="message"
            value={values.message}
            onChange={(value) => updateField("message", value)}
            placeholder="Cuéntanos qué tienes en mente…"
            maxLength={CONTACT_LIMITS.message}
            disabled={isPending}
            invalid={invalid.includes("message")}
            multiline
          />

          {/* Honeypot anti-spam: campo oculto que los bots suelen completar */}
          <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
            <label htmlFor="website">Sitio web</label>
            <input
              id="website"
              name="website"
              type="text"
              value={values.website}
              onChange={(event) => setValues((prev) => ({ ...prev, website: event.target.value }))}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <NeonButton
            variant="solid"
            accent="cyan"
            size="lg"
            type="submit"
            disabled={isPending}
            className="mt-2 w-full"
          >
            {isPending ? "▶ TRANSMITIENDO…" : "▶ ENVIAR MENSAJE"}
          </NeonButton>
        </form>
      )}
    </div>
  );
}
