"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EditEventButton, CATEGORY_LABELS } from "./event-dialog";
import { formatEventDate, todayDateOnly, toDateParam } from "./date-utils";
import type { CalendarCategory } from "@/generated/prisma/enums";
import type { getEvents } from "./queries";

type Events = Awaited<ReturnType<typeof getEvents>>;

const ALL = "ALL";

export function EventsList({ events }: { events: Events }) {
  const [category, setCategory] = useState<CalendarCategory | typeof ALL>(ALL);
  const [showPast, setShowPast] = useState(false);

  const today = todayDateOnly();

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (category !== ALL && e.category !== category) return false;
      if (!showPast && e.date.getTime() < today.getTime()) return false;
      return true;
    });
  }, [events, category, showPast, today]);

  const groups = useMemo(() => {
    const map = new Map<string, Events>();
    for (const e of filtered) {
      const key = toDateParam(e.date);
      const list = map.get(key) ?? [];
      list.push(e);
      map.set(key, list);
    }
    return [...map.entries()];
  }, [filtered]);

  const pastCount = events.length - events.filter((e) => e.date.getTime() >= today.getTime()).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Select value={category} onValueChange={(v) => setCategory((v as CalendarCategory | typeof ALL) ?? ALL)}>
          <SelectTrigger className="w-full">
            <SelectValue>
              {(v: CalendarCategory | typeof ALL) => (v === ALL ? "All categories" : CATEGORY_LABELS[v])}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All categories</SelectItem>
            {(Object.keys(CATEGORY_LABELS) as CalendarCategory[]).map((c) => (
              <SelectItem key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {pastCount > 0 && (
          <Button type="button" variant="ghost" size="sm" className="shrink-0" onClick={() => setShowPast((v) => !v)}>
            {showPast ? "Hide past" : `Show past (${pastCount})`}
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {groups.map(([dateKey, dayEvents]) => (
          <div key={dateKey} className="space-y-1.5">
            <h2 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              {formatEventDate(dayEvents[0].date)}
            </h2>
            <Card>
              <CardContent className="divide-y py-0">
                {dayEvents.map((event) => (
                  <div key={event.id} className="flex items-start justify-between gap-2 py-2.5">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-sm font-medium">{event.title}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {CATEGORY_LABELS[event.category]}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        {event.time}
                        {event.time && event.location ? " · " : ""}
                        {event.location}
                      </p>
                      {event.notes && <p className="mt-0.5 text-xs">{event.notes}</p>}
                    </div>
                    <EditEventButton event={event} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        ))}
        {groups.length === 0 && (
          <p className="text-muted-foreground py-8 text-center text-sm">No events{showPast ? "" : " upcoming"}.</p>
        )}
      </div>
    </div>
  );
}
