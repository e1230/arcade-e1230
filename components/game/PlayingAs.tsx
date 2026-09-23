"use client";

import { getPlayerName, useSession } from "@/lib/session";

export function PlayingAs() {
  const { user } = useSession();
  const isGuestNote = !user || user.guest;

  return (
    <p className="m-0 text-sm text-muted">
      Jugando como <strong className="text-foreground">{getPlayerName(user)}</strong>
      {isGuestNote ? " · las puntuaciones solo se guardan en este dispositivo" : ""}
    </p>
  );
}
