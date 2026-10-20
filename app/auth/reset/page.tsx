import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { fetchSessionUser } from "@/lib/session-server";

export const metadata: Metadata = {
  title: "Nueva contraseña",
};

export default async function ResetPasswordPage() {
  // Se llega con la sesión que abrió el enlace del correo; sin ella, el enlace no sirvió
  const user = await fetchSessionUser();
  if (!user) redirect("/login?error=link");

  return (
    <div className="flex flex-1 items-center justify-center px-5 py-10">
      <ResetPasswordForm />
    </div>
  );
}
