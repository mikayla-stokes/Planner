"use client";

import { cn } from "@/lib/utils";

const SCALE = Array.from({ length: 10 }, (_, i) => i + 1);

export function ScaleInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="grid grid-cols-10 gap-1">
      {SCALE.map((n) => (
        <button
          type="button"
          key={n}
          onClick={() => onChange(n)}
          className={cn(
            "flex h-8 items-center justify-center rounded-md border text-xs font-medium transition-colors",
            n === value
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border text-muted-foreground hover:bg-accent",
          )}
        >
          {n}
        </button>
      ))}
    </div>
  );
}
