import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard, type AuthTab } from "@/components/auth/AuthCard";
import { LINK_ERROR_MESSAGE, OAUTH_ERROR_MESSAGE } from "@/lib/auth";
import { safeNextPath } from "@/lib/safe-next";
import { fetchSessionUser } from "@/lib/session-server";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

// Errores que llegan de /auth/callback y de /auth/reset
const ERROR_MESSAGES: Record<string, string> = {
  oauth: OAUTH_ERROR_MESSAGE,
  link: LINK_ERROR_MESSAGE,
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { mode, next: rawNext, error } = await searchParams;
  const initialTab: AuthTab = mode === "register" ? "register" : "login";
  // null si no vino ?next=: el invitado va entonces a /games y el login al Home
  const next = rawNext === undefined ? null : safeNextPath(rawNext);

  // Con sesión no hay nada que hacer aquí; sin alias se pasa antes por /onboarding
  const user = await fetchSessionUser();
  if (user) {
    const destination = next ?? "/";
    redirect(
      user.alias
        ? destination
        : `/onboarding?next=${encodeURIComponent(destination)}`,
    );
  }

  const initialError =
    typeof error === "string" ? (ERROR_MESSAGES[error] ?? "") : "";

  return (
    <div className="flex flex-1 items-center justify-center px-5 py-10">
      <AuthCard
        key={initialTab}
        initialTab={initialTab}
        next={next}
        initialError={initialError}
      />
    </div>
  );
}
