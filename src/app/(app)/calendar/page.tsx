import { getEvents } from "./queries";
import { EventsList } from "./events-list";
import { AddEventButton } from "./event-dialog";
import { ExportButton } from "@/components/export-button";
import { dateOnly, label } from "@/lib/export";

export default async function CalendarPage() {
  const events = await getEvents();

  const exportSheets = [
    {
      name: "Events",
      rows: events.map((e) => ({
        Event: e.title,
        Date: dateOnly(e.date),
        Time: e.time,
        Category: label(e.category),
        Location: e.location,
        Notes: e.notes,
      })),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground text-sm">{events.length} events</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ExportButton filename="calendar" sheets={exportSheets} />
          <AddEventButton />
        </div>
      </div>
      <EventsList events={events} />
    </div>
  );
}
