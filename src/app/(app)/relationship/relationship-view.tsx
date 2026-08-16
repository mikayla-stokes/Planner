"use client";

import { useActingAs } from "@/lib/acting-as";
import { CheckInForm } from "./checkin-form";
import { CheckInCard } from "./checkin-card";
import { HistoryList } from "./history-list";
import { GoalsList } from "./goals-list";
import { AddGoalButton } from "./goal-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { getProfiles, getTodayCheckIns, getHistory, getGoals } from "./queries";

type Profiles = Awaited<ReturnType<typeof getProfiles>>;
type TodayCheckIns = Awaited<ReturnType<typeof getTodayCheckIns>>;
type History = Awaited<ReturnType<typeof getHistory>>;
type Goals = Awaited<ReturnType<typeof getGoals>>;

export function RelationshipView({
  profiles,
  todayCheckIns,
  history,
  goals,
}: {
  profiles: Profiles;
  todayCheckIns: TodayCheckIns;
  history: History;
  goals: Goals;
}) {
  const { actingAs } = useActingAs();
  const me = profiles.find((p) => p.name === actingAs);
  const partner = profiles.find((p) => p.name !== actingAs);
  const myCheckIn = todayCheckIns.find((c) => c.profileId === me?.id) ?? null;
  const partnerCheckIn = todayCheckIns.find((c) => c.profileId === partner?.id) ?? null;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Relationship</h1>
        <p className="text-muted-foreground text-sm">Daily check-ins and shared goals.</p>
      </div>

      <Tabs defaultValue="checkin">
        <TabsList>
          <TabsTrigger value="checkin">Check-In</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="checkin" className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {me && <CheckInForm key={me.id} name={me.name} profileId={me.id} existing={myCheckIn} />}
            {partner && <CheckInCard name={partner.name} checkIn={partnerCheckIn} />}
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold tracking-tight">History</h2>
            <HistoryList history={history} />
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-3">
          <div className="flex justify-end">
            <AddGoalButton profiles={profiles} />
          </div>
          <GoalsList goals={goals} profiles={profiles} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
