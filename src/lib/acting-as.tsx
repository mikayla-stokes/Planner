"use client";

import { createContext, useContext, useSyncExternalStore } from "react";

export type ActingAs = "Mikayla" | "Caleb";

const STORAGE_KEY = "life-planner:acting-as";
const listeners = new Set<() => void>();

function isActingAs(value: string | null): value is ActingAs {
  return value === "Mikayla" || value === "Caleb";
}

function getSnapshot(): ActingAs {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return isActingAs(stored) ? stored : "Mikayla";
}

function getServerSnapshot(): ActingAs {
  return "Mikayla";
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function writeActingAs(value: ActingAs) {
  window.localStorage.setItem(STORAGE_KEY, value);
  listeners.forEach((callback) => callback());
}

const ActingAsContext = createContext<{
  actingAs: ActingAs;
  setActingAs: (value: ActingAs) => void;
} | null>(null);

export function ActingAsProvider({ children }: { children: React.ReactNode }) {
  const actingAs = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <ActingAsContext.Provider value={{ actingAs, setActingAs: writeActingAs }}>
      {children}
    </ActingAsContext.Provider>
  );
}

export function useActingAs() {
  const ctx = useContext(ActingAsContext);
  if (!ctx) throw new Error("useActingAs must be used within ActingAsProvider");
  return ctx;
}
