"use client";

import { useState, useTransition } from "react";
import type { getHomeProjects } from "./queries";
import { toggleHomeProject } from "./actions";
import { EditProjectButton } from "./project-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Projects = Awaited<ReturnType<typeof getHomeProjects>>;

const PRIORITY_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  HIGH: "default",
  MEDIUM: "secondary",
  LOW: "outline",
};

function ProjectRow({ project }: { project: Projects[number] }) {
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
        <span className={cn("text-sm", completed && "text-muted-foreground line-through")}>
          {project.title}
        </span>
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

export function ProjectsList({ projects }: { projects: Projects }) {
  return (
    <Card>
      <CardContent className="divide-y py-0">
        {projects.map((project) => (
          <ProjectRow key={project.id} project={project} />
        ))}
        {projects.length === 0 && (
          <p className="text-muted-foreground py-8 text-center text-sm">No home projects yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
