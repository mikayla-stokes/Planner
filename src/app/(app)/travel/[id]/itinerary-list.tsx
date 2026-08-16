import { Card, CardContent } from "@/components/ui/card";
import { EditItineraryItemButton } from "./itinerary-dialog";

type Item = {
  id: string;
  date: Date | null;
  time: string | null;
  description: string;
  location: string | null;
};

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });
}

export function ItineraryList({ items, tripId }: { items: Item[]; tripId: string }) {
  const groups = new Map<string, Item[]>();
  for (const item of items) {
    const key = item.date ? item.date.toISOString() : "_no_date";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }
  const keys = [...groups.keys()].sort((a, b) => {
    if (a === "_no_date") return 1;
    if (b === "_no_date") return -1;
    return a.localeCompare(b);
  });

  if (items.length === 0) {
    return <p className="text-muted-foreground py-4 text-center text-sm">No itinerary items yet.</p>;
  }

  return (
    <div className="space-y-3">
      {keys.map((key) => {
        const groupItems = groups.get(key)!;
        return (
          <div key={key} className="space-y-1.5">
            <h3 className="text-muted-foreground text-xs font-medium">
              {key === "_no_date" ? "No date set" : formatDate(groupItems[0].date!)}
            </h3>
            <Card>
              <CardContent className="divide-y py-0">
                {groupItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-2.5">
                    {item.time && (
                      <span className="text-muted-foreground w-16 shrink-0 text-sm font-medium">{item.time}</span>
                    )}
                    <div className="flex-1">
                      <p className="text-sm">{item.description}</p>
                      {item.location && <p className="text-muted-foreground text-xs">{item.location}</p>}
                    </div>
                    <EditItineraryItemButton item={item} tripId={tripId} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
