"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toggleChecklistItem } from "../wedding/checklist/actions";
import { AddChecklistItemButton, EditChecklistItemButton } from "../wedding/checklist/checklist-item-dialog";
import type { getWeddingPriorities } from "./queries";

type Items = Awaited<ReturnType<typeof getWeddingPriorities>>;

const PRIORITY_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  HIGH: "default",
  MEDIUM: "secondary",
  LOW: "outline",
};

function ChecklistRow({ item }: { item: Items[number] }) {
  const [completed, setCompleted] = useState(item.completed);
  const [pending, startTransition] = useTransition();

  return (
    <div className={cn("flex items-start gap-2.5 py-2", pending && "opacity-60")}>
      <Checkbox
        checked={completed}
        onCheckedChange={(checked) => {
          const next = checked === true;
          setCompleted(next);
          startTransition(async () => {
            try {
              await toggleChecklistItem(item.id, next);
            } catch {
              setCompleted(!next);
            }
          });
        }}
        className="mt-0.5"
      />
      <div className="min-w-0 flex-1">
        <span className={cn("text-sm", completed && "text-muted-foreground line-through")}>{item.title}</span>
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
          {item.priority && (
            <Badge variant={PRIORITY_VARIANT[item.priority]} className="text-[10px]">
              {item.priority}
            </Badge>
          )}
          {item.owner !== "SHARED" && (
            <Badge variant="secondary" className="text-[10px]">
              {item.owner === "UNDECIDED" ? "TBD" : item.owner}
            </Badge>
          )}
        </div>
      </div>
      <EditChecklistItemButton item={item} />
    </div>
  );
}

export function WeddingPriorities({ items, milestoneId }: { items: Items; milestoneId: string | null }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold tracking-tight">Wedding Priorities</h2>
        {milestoneId && <AddChecklistItemButton milestoneId={milestoneId} defaultPriority="MEDIUM" />}
      </div>
      <Card>
        <CardContent className="divide-y py-0">
          {items.map((item) => (
            <ChecklistRow key={item.id} item={item} />
          ))}
          {items.length === 0 && (
            <p className="text-muted-foreground py-6 text-center text-sm">No priority checklist items.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
