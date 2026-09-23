"use client";

import { STORAGE_KEYS, useStoredValue, writeStoredValue } from "./storage";

export interface SessionUser {
  name: string;
  guest: boolean;
}

const NO_USER: SessionUser | null = null;

export function useSession(): {
  user: SessionUser | null;
  signIn(user: SessionUser): void;
  signOut(): void;
} {
  const user = useStoredValue<SessionUser | null>(STORAGE_KEYS.user, NO_USER);

  return {
    user,
    signIn(next: SessionUser) {
      writeStoredValue(STORAGE_KEYS.user, next);
    },
    signOut() {
      writeStoredValue(STORAGE_KEYS.user, null);
    },
  };
}

export function getPlayerName(user: SessionUser | null): string {
  return user?.name ?? "INVITADO";
}
