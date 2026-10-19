"use client";

import { useSession } from "@/lib/session";

export function PlayingAs() {
  const { user } = useSession();

  if (user && !user.alias) {
    return (
      <p className="m-0 text-sm text-muted">
        Jugando sin alias · elige uno para guardar tus puntuaciones
      </p>
    );
  }

  return (
    <p className="m-0 text-sm text-muted">
      Jugando como{" "}
      <strong className="text-foreground">{user?.alias ?? "INVITADO"}</strong>
      {user ? "" : " · inicia sesión para guardar tus puntuaciones"}
    </p>
  );
}
