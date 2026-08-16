import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AddTimelineEventButton, EditTimelineEventButton } from "./timeline-event-dialog";
import type { TimelineEvent } from "@/generated/prisma/client";

export default async function TimelinePage() {
  const events = await db.timelineEvent.findMany({ orderBy: { sortOrder: "asc" } });
  const weddingDay = events.filter((e) => e.subEvent === "WEDDING_DAY");
  const bachelorette = events.filter((e) => e.subEvent === "BACHELORETTE_WEEKEND");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Timeline</h1>
        <p className="text-muted-foreground text-sm">The day-of schedule and the bachelorette itinerary.</p>
      </div>

      <Tabs defaultValue="wedding-day">
        <TabsList>
          <TabsTrigger value="wedding-day">Wedding Day</TabsTrigger>
          <TabsTrigger value="bachelorette">Bachelorette Weekend</TabsTrigger>
        </TabsList>
        <TabsContent value="wedding-day">
          <TimelineList events={weddingDay} subEvent="WEDDING_DAY" />
        </TabsContent>
        <TabsContent value="bachelorette">
          <TimelineList events={bachelorette} subEvent="BACHELORETTE_WEEKEND" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TimelineList({
  events,
  subEvent,
}: {
  events: TimelineEvent[];
  subEvent: TimelineEvent["subEvent"];
}) {
  return (
    <Card>
      <CardContent className="divide-y py-0">
        {events.map((event) => (
          <div key={event.id} className="flex items-center gap-3 py-2.5">
            <span className="text-muted-foreground w-20 shrink-0 text-sm font-medium">
              {event.time}
            </span>
            <div className="flex-1">
              <p className="text-sm">{event.description}</p>
              {event.location && (
                <p className="text-muted-foreground text-xs">{event.location}</p>
              )}
            </div>
            <EditTimelineEventButton event={event} />
          </div>
        ))}
        <div className="py-2">
          <AddTimelineEventButton subEvent={subEvent} />
        </div>
      </CardContent>
    </Card>
  );
}
