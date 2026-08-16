import { CheckInCard } from "./checkin-card";
import { formatCheckInDate } from "./date-utils";
import type { getHistory } from "./queries";

type History = Awaited<ReturnType<typeof getHistory>>;

export function HistoryList({ history }: { history: History }) {
  const byDate = new Map<string, History>();
  for (const entry of history) {
    const key = entry.date.toISOString();
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key)!.push(entry);
  }

  const dates = [...byDate.keys()].sort().reverse();

  if (dates.length === 0) {
    return <p className="text-muted-foreground text-sm">No past check-ins yet.</p>;
  }

  return (
    <div className="space-y-4">
      {dates.map((dateKey) => {
        const entries = byDate.get(dateKey)!;
        return (
          <div key={dateKey} className="space-y-2">
            <h3 className="text-muted-foreground text-xs font-medium">
              {formatCheckInDate(entries[0].date)}
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {entries.map((entry) => (
                <CheckInCard key={entry.id} name={entry.profile.name} checkIn={entry} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
