import { getEvents } from "./queries";
import { EventsList } from "./events-list";
import { AddEventButton } from "./event-dialog";

export default async function CalendarPage() {
  const events = await getEvents();

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground text-sm">{events.length} events</p>
        </div>
        <AddEventButton />
      </div>
      <EventsList events={events} />
    </div>
  );
}
