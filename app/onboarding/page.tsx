import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AliasForm } from "@/components/auth/AliasForm";
import { safeNextPath } from "@/lib/safe-next";
import { fetchSessionUser } from "@/lib/session-server";

export const metadata: Metadata = {
  title: "Elige tu alias",
};

export default async function OnboardingPage({
  searchParams,
}: PageProps<"/onboarding">) {
  const next = safeNextPath((await searchParams).next);
  const user = await fetchSessionUser();

  // Sin sesión no hay cuenta a la que ponerle alias; con alias no hay nada que elegir
  if (!user) {
    const onboarding = `/onboarding?next=${encodeURIComponent(next)}`;
    redirect(`/login?next=${encodeURIComponent(onboarding)}`);
  }
  if (user.alias) redirect(next);

  return (
    <div className="flex flex-1 items-center justify-center px-5 py-10">
      <AliasForm next={next} />
    </div>
  );
}
