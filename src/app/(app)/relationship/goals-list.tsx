"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditGoalButton } from "./goal-dialog";
import type { getGoals, getProfiles } from "./queries";

type Goals = Awaited<ReturnType<typeof getGoals>>;
type Profiles = Awaited<ReturnType<typeof getProfiles>>;

const FILTERS = ["All", "Mikayla", "Caleb"] as const;
type Filter = (typeof FILTERS)[number];

function ownerMatches(profileName: string | undefined, filter: Filter) {
  if (filter === "All") return true;
  // Shared goals (no profile) belong to both people's view.
  return !profileName || profileName === filter;
}

function periodLabel(g: Goals[number]) {
  return g.period === "QUARTERLY" ? `Q${g.quarter} ${g.year}` : `${g.year}`;
}

export function GoalsList({ goals, profiles }: { goals: Goals; profiles: Profiles }) {
  const [filter, setFilter] = useState<Filter>("All");

  const filtered = useMemo(
    () => goals.filter((g) => ownerMatches(g.profile?.name, filter)),
    [goals, filter],
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

      <div className="space-y-2">
        {filtered.map((goal) => (
          <Card key={goal.id}>
            <CardContent className="space-y-2 py-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className={goal.completed ? "text-muted-foreground text-sm line-through" : "text-sm font-medium"}>
                    {goal.title}
                  </p>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px]">
                      {periodLabel(goal)}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {goal.profile?.name ?? "Shared"}
                    </Badge>
                  </div>
                </div>
                <EditGoalButton goal={goal} profiles={profiles} />
              </div>
              <div className="space-y-1">
                <Progress value={goal.progress} className="h-1.5" />
                <p className="text-muted-foreground text-xs">{goal.progress}%</p>
              </div>
              {goal.notes && <p className="text-sm">{goal.notes}</p>}
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="text-muted-foreground py-8 text-center text-sm">
            No {filter !== "All" ? `${filter.toLowerCase()} ` : ""}goals yet.
          </p>
        )}
      </div>
    </div>
  );
}
