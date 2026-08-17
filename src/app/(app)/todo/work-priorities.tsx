"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toggleTask } from "../work/actions";
import { AddTaskButton, EditTaskButton } from "../work/task-dialog";
import type { getWorkPriorities, getProfiles } from "./queries";

type Tasks = Awaited<ReturnType<typeof getWorkPriorities>>;
type Profiles = Awaited<ReturnType<typeof getProfiles>>;

const PRIORITY_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  HIGH: "default",
  MEDIUM: "secondary",
  LOW: "outline",
};

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
        <span className={cn("text-sm", completed && "text-muted-foreground line-through")}>{task.title}</span>
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
            <span className="text-muted-foreground text-xs">
              {task.dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          )}
        </div>
      </div>
      <EditTaskButton task={task} profiles={profiles} />
    </div>
  );
}

export function WorkPriorities({ tasks, profiles }: { tasks: Tasks; profiles: Profiles }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold tracking-tight">Work Priorities</h2>
        <AddTaskButton profiles={profiles} defaultPriority="MEDIUM" />
      </div>
      <Card>
        <CardContent className="divide-y py-0">
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} profiles={profiles} />
          ))}
          {tasks.length === 0 && (
            <p className="text-muted-foreground py-6 text-center text-sm">No priority work tasks.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
