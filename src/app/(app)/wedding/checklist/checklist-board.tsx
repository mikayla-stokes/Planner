"use client";

import { useMemo, useState, useTransition } from "react";
import type { getMilestonesWithItems } from "./queries";
import { toggleChecklistItem } from "./actions";
import { AddChecklistItemButton, EditChecklistItemButton } from "./checklist-item-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Milestones = Awaited<ReturnType<typeof getMilestonesWithItems>>;
type Item = Milestones[number]["items"][number];
type SubItem = Item["subItems"][number];

const FILTERS = ["All", "Mikayla", "Caleb"] as const;
type Filter = (typeof FILTERS)[number];

const PRIORITY_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  HIGH: "default",
  MEDIUM: "secondary",
  LOW: "outline",
};

function ownerMatches(owner: string, filter: Filter) {
  if (filter === "All") return true;
  // Shared items belong to both people's view; per-person filters also
  // implicitly include Shared so nothing gets hidden from either of you.
  return owner === "SHARED" || owner.toLowerCase() === filter.toLowerCase();
}

function ChecklistRow({ item, indent = false }: { item: Item | SubItem; indent?: boolean }) {
  const [completed, setCompleted] = useState(item.completed);
  const [pending, startTransition] = useTransition();

  return (
    <div
      className={cn(
        "group flex items-start gap-2.5 rounded-md py-1.5",
        indent && "ml-6",
        pending && "opacity-60",
      )}
    >
      <Checkbox
        checked={completed}
        onCheckedChange={(checked) => {
          const next = checked === true;
          setCompleted(next);
          startTransition(async () => {
            try {
              await toggleChecklistItem(item.id, next);
            } catch {
              setCompleted(!next); // save failed — don't leave the UI showing an unsaved state
            }
          });
        }}
        className="mt-0.5"
      />
      <span className={cn("text-sm", completed && "text-muted-foreground line-through")}>
        {item.title}
      </span>
      <div className="ml-auto flex shrink-0 items-center gap-1">
        {item.priority && (
          <Badge variant={PRIORITY_VARIANT[item.priority]} className="text-[10px]">
            {item.priority}
          </Badge>
        )}
        {"owner" in item && item.owner !== "SHARED" && (
          <Badge variant="secondary" className="text-[10px]">
            {item.owner === "UNDECIDED" ? "TBD" : item.owner}
          </Badge>
        )}
        <EditChecklistItemButton item={item} />
      </div>
    </div>
  );
}

export function ChecklistBoard({ milestones }: { milestones: Milestones }) {
  const [filter, setFilter] = useState<Filter>("All");
  const [hideCompleted, setHideCompleted] = useState(false);

  const filtered = useMemo(() => {
    return milestones.map((milestone) => ({
      ...milestone,
      items: milestone.items.filter((item) => ownerMatches(item.owner, filter)),
    }));
  }, [milestones, filter]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList>
            {FILTERS.map((f) => (
              <TabsTrigger key={f} value={f}>
                {f}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Button type="button" variant="ghost" size="sm" onClick={() => setHideCompleted((v) => !v)}>
          {hideCompleted ? "Show completed" : "Hide completed"}
        </Button>
      </div>

      {filtered.map((milestone) => {
        const total = milestone.items.length;
        const done = milestone.items.filter((i) => i.completed).length;
        const pct = total === 0 ? 0 : Math.round((done / total) * 100);
        const visibleItems = hideCompleted ? milestone.items.filter((i) => !i.completed) : milestone.items;

        return (
          <Card key={milestone.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-base">{milestone.label}</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs">
                    {done}/{total}
                  </span>
                  <AddChecklistItemButton milestoneId={milestone.id} />
                </div>
              </div>
              <Progress value={pct} className="h-1.5" />
            </CardHeader>
            <CardContent className="space-y-0.5">
              {visibleItems.map((item) => (
                <div key={item.id}>
                  <ChecklistRow item={item} />
                  {item.subItems
                    .filter((sub) => ownerMatches(sub.owner, filter) && !(hideCompleted && sub.completed))
                    .map((sub) => (
                      <ChecklistRow key={sub.id} item={sub} indent />
                    ))}
                </div>
              ))}
              {total === 0 && (
                <p className="text-muted-foreground py-2 text-sm">Nothing here yet.</p>
              )}
              {total > 0 && visibleItems.length === 0 && (
                <p className="text-muted-foreground py-2 text-sm">All done! 🎉</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
