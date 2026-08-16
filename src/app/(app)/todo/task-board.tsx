"use client";

import { useMemo, useState, useTransition } from "react";
import type { getTasks, getProfiles } from "./queries";
import { toggleTask } from "./actions";
import { EditTaskButton } from "./task-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type Tasks = Awaited<ReturnType<typeof getTasks>>;
type Profiles = Awaited<ReturnType<typeof getProfiles>>;

const FILTERS = ["All", "Mikayla", "Caleb"] as const;
type Filter = (typeof FILTERS)[number];

function ownerMatches(profileName: string | undefined, filter: Filter) {
  if (filter === "All") return true;
  // Unassigned ("Either") tasks belong to both people's view.
  return !profileName || profileName === filter;
}

const PRIORITY_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  HIGH: "default",
  MEDIUM: "secondary",
  LOW: "outline",
};

function isOverdue(dueDate: Date | null, completed: boolean) {
  if (!dueDate || completed) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dueDate.getTime() < today.getTime();
}

function TaskRow({ task, profiles }: { task: Tasks[number]; profiles: Profiles }) {
  const [completed, setCompleted] = useState(task.completed);
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
              await toggleTask(task.id, next);
            } catch {
              setCompleted(!next);
            }
          });
        }}
        className="mt-0.5"
      />
      <div className="min-w-0 flex-1">
        <span className={cn("text-sm", completed && "text-muted-foreground line-through")}>
          {task.title}
        </span>
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
          {task.priority && (
            <Badge variant={PRIORITY_VARIANT[task.priority]} className="text-[10px]">
              {task.priority}
            </Badge>
          )}
          {task.profile && (
            <Badge variant="outline" className="text-[10px]">
              {task.profile.name}
            </Badge>
          )}
          {task.dueDate && (
            <span
              className={cn(
                "text-xs",
                isOverdue(task.dueDate, completed) ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {task.dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          )}
        </div>
      </div>
      <EditTaskButton task={task} profiles={profiles} />
    </div>
  );
}

export function TaskBoard({ tasks, profiles }: { tasks: Tasks; profiles: Profiles }) {
  const [filter, setFilter] = useState<Filter>("All");

  const filtered = useMemo(
    () => tasks.filter((t) => ownerMatches(t.profile?.name, filter)),
    [tasks, filter],
  );

  return (
    <div className="space-y-3">
      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
        <TabsList>
          {FILTERS.map((f) => (
            <TabsTrigger key={f} value={f}>
              {f}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="divide-y py-0">
          {filtered.map((task) => (
            <TaskRow key={task.id} task={task} profiles={profiles} />
          ))}
          {filtered.length === 0 && (
            <p className="text-muted-foreground py-8 text-center text-sm">
              Nothing here{filter !== "All" ? ` for ${filter}` : ""}.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
