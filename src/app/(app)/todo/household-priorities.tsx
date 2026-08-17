"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toggleHomeProject, markChoreDone } from "../household/actions";
import { AddProjectButton, EditProjectButton } from "../household/project-dialog";
import { EditChoreButton } from "../household/chore-dialog";
import { isChoreDue } from "../household/due-status";
import type { getHouseholdPriorities, getProfiles } from "./queries";

type Items = Awaited<ReturnType<typeof getHouseholdPriorities>>;
type ProjectItem = Extract<Items[number], { kind: "project" }>["project"];
type ChoreItem = Extract<Items[number], { kind: "chore" }>["chore"];
type Profiles = Awaited<ReturnType<typeof getProfiles>>;

const PRIORITY_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  HIGH: "default",
  MEDIUM: "secondary",
  LOW: "outline",
};

const FREQUENCY_LABELS: Record<string, string> = { DAILY: "Daily", WEEKLY: "Weekly", MONTHLY: "Monthly" };

function ProjectRow({ project }: { project: ProjectItem }) {
  const [completed, setCompleted] = useState(project.completed);
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
              await toggleHomeProject(project.id, next);
            } catch {
              setCompleted(!next);
            }
          });
        }}
        className="mt-0.5"
      />
      <div className="min-w-0 flex-1">
        <span className={cn("text-sm", completed && "text-muted-foreground line-through")}>{project.title}</span>
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
          {project.priority && (
            <Badge variant={PRIORITY_VARIANT[project.priority]} className="text-[10px]">
              {project.priority}
            </Badge>
          )}
          {project.dueDate && (
            <span className="text-muted-foreground text-xs">
              {project.dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          )}
        </div>
      </div>
      <EditProjectButton project={project} />
    </div>
  );
}

function ChoreRow({ chore, profiles }: { chore: ChoreItem; profiles: Profiles }) {
  const [lastCompletedAt, setLastCompletedAt] = useState(chore.lastCompletedAt);
  const [pending, startTransition] = useTransition();
  const due = isChoreDue(chore.frequency, lastCompletedAt);

  return (
    <div className={cn("flex items-start gap-2.5 py-2", pending && "opacity-60")}>
      <div className="min-w-0 flex-1">
        <span className={cn("text-sm", !due && "text-muted-foreground line-through")}>{chore.title}</span>
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
          {chore.priority && (
            <Badge variant={PRIORITY_VARIANT[chore.priority]} className="text-[10px]">
              {chore.priority}
            </Badge>
          )}
          <Badge variant="outline" className="text-[10px]">
            {FREQUENCY_LABELS[chore.frequency]}
          </Badge>
          {chore.assignee && (
            <Badge variant="secondary" className="text-[10px]">
              {chore.assignee.name}
            </Badge>
          )}
        </div>
      </div>
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
  );
}

export function HouseholdPriorities({ items, profiles }: { items: Items; profiles: Profiles }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold tracking-tight">Household Priorities</h2>
        <AddProjectButton defaultPriority="MEDIUM" />
      </div>
      <Card>
        <CardContent className="divide-y py-0">
          {items.map((item) =>
            item.kind === "project" ? (
              <ProjectRow key={`p-${item.project.id}`} project={item.project} />
            ) : (
              <ChoreRow key={`c-${item.chore.id}`} chore={item.chore} profiles={profiles} />
            ),
          )}
          {items.length === 0 && (
            <p className="text-muted-foreground py-6 text-center text-sm">No priority projects or chores.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
