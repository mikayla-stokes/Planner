import Link from "next/link";
import { getTrips } from "./queries";
import { AddTripButton } from "./trip-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatRange(start: Date | null, end: Date | null) {
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", timeZone: "UTC" };
  if (start && end) {
    return `${start.toLocaleDateString("en-US", opts)} – ${end.toLocaleDateString("en-US", opts)}`;
  }
  if (start) return start.toLocaleDateString("en-US", opts);
  return null;
}

export default async function TravelPage() {
  const trips = await getTrips();

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Travel</h1>
          <p className="text-muted-foreground text-sm">{trips.length} trips</p>
        </div>
        <AddTripButton />
      </div>

      <div className="space-y-2">
        {trips.map((trip) => (
          <Link key={trip.id} href={`/travel/${trip.id}`}>
            <Card className="hover:border-primary/40 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{trip.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                {[trip.destination, formatRange(trip.startDate, trip.endDate)].filter(Boolean).join(" · ") || "No details yet"}
              </CardContent>
            </Card>
          </Link>
        ))}
        {trips.length === 0 && (
          <p className="text-muted-foreground py-8 text-center text-sm">No trips yet.</p>
        )}
      </div>
    </div>
  );
}
