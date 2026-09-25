"use client";

import { useCallback, useSyncExternalStore } from "react";

export const STORAGE_KEYS = { user: "e1230_user" } as const;

// Caché por clave: guarda el string crudo junto con el valor parseado,
// así getSnapshot devuelve la misma referencia mientras localStorage no cambie
// (evita el bucle infinito de useSyncExternalStore con snapshots nuevos en cada llamada).
const cache = new Map<string, { raw: string | null; value: unknown }>();

function readRaw(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function getParsedValue<T>(key: string, fallback: T): T {
  const raw = readRaw(key);
  const cached = cache.get(key);
  if (cached && cached.raw === raw) {
    return cached.value as T;
  }
  let value: T = fallback;
  if (raw !== null) {
    try {
      value = JSON.parse(raw) as T;
    } catch {
      value = fallback;
    }
  }
  cache.set(key, { raw, value });
  return value;
}

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.storageArea === localStorage) notify();
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useStoredValue<T>(key: string, fallback: T): T {
  const getSnapshot = useCallback(
    () => getParsedValue(key, fallback),
    [key, fallback],
  );
  const getServerSnapshot = useCallback(() => fallback, [fallback]);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function writeStoredValue<T>(key: string, value: T | null): void {
  try {
    if (value === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {
    // localStorage bloqueado (modo privado, cookies bloqueadas): la UI sigue funcionando sin persistir
  }
  notify();
}
