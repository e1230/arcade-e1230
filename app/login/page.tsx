import type { Metadata } from "next";
import { AuthCard, type AuthTab } from "@/components/auth/AuthCard";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { mode } = await searchParams;
  const initialTab: AuthTab = mode === "register" ? "register" : "login";

  return (
    <div className="flex flex-1 items-center justify-center px-5 py-10">
      <AuthCard key={initialTab} initialTab={initialTab} />
    </div>
  );
}
