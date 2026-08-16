"use client";

import { useState, useTransition } from "react";
import type { getChores, getProfiles } from "./queries";
import { markChoreDone } from "./actions";
import { isChoreDue, choreStatusLabel } from "./due-status";
import { EditChoreButton } from "./chore-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Chores = Awaited<ReturnType<typeof getChores>>;
type Profiles = Awaited<ReturnType<typeof getProfiles>>;

const FREQUENCY_LABELS: Record<string, string> = { DAILY: "Daily", WEEKLY: "Weekly", MONTHLY: "Monthly" };
const PRIORITY_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  HIGH: "default",
  MEDIUM: "secondary",
  LOW: "outline",
};

function ChoreRow({ chore, profiles }: { chore: Chores[number]; profiles: Profiles }) {
  const [lastCompletedAt, setLastCompletedAt] = useState(chore.lastCompletedAt);
  const [pending, startTransition] = useTransition();
  const due = isChoreDue(chore.frequency, lastCompletedAt);

  return (
    <div className={cn("flex items-start justify-between gap-3 py-2.5", pending && "opacity-60")}>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-sm font-medium">{chore.title}</span>
          <Badge variant={due ? "default" : "outline"} className="text-[10px]">
            {due ? "Due" : "Not due"}
          </Badge>
          {chore.priority && (
            <Badge variant={PRIORITY_VARIANT[chore.priority]} className="text-[10px]">
              {chore.priority}
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground mt-0.5 text-xs">
          {FREQUENCY_LABELS[chore.frequency]}
          {chore.assignee ? ` · ${chore.assignee.name}` : ""} · {choreStatusLabel(chore.frequency, lastCompletedAt)}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          size="sm"
          variant={due ? "default" : "outline"}
          disabled={pending}
          onClick={() => {
            const now = new Date();
            const previous = lastCompletedAt;
            setLastCompletedAt(now);
            startTransition(async () => {
              try {
                await markChoreDone(chore.id);
              } catch {
                setLastCompletedAt(previous);
              }
            });
          }}
        >
          Mark done
        </Button>
        <EditChoreButton chore={chore} profiles={profiles} />
      </div>
    </div>
  );
}

export function ChoresList({ chores, profiles }: { chores: Chores; profiles: Profiles }) {
  return (
    <Card>
      <CardContent className="divide-y py-0">
        {chores.map((chore) => (
          <ChoreRow key={chore.id} chore={chore} profiles={profiles} />
        ))}
        {chores.length === 0 && (
          <p className="text-muted-foreground py-8 text-center text-sm">No chores yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
