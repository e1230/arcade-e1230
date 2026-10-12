import { useSyncExternalStore } from "react";

function subscribeCoarsePointer(callback: () => void) {
  const query = window.matchMedia("(pointer: coarse)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getCoarsePointerSnapshot() {
  return window.matchMedia("(pointer: coarse)").matches;
}

function getCoarsePointerServerSnapshot() {
  return false;
}

// Indica si el dispositivo principal de entrada es táctil (puntero grueso).
export function useIsCoarsePointer() {
  return useSyncExternalStore(
    subscribeCoarsePointer,
    getCoarsePointerSnapshot,
    getCoarsePointerServerSnapshot,
  );
}
