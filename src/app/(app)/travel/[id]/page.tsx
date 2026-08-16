import { notFound } from "next/navigation";
import { getTripDetail } from "./queries";
import { getDuplicateCandidates } from "./packing-actions";
import { EditTripButton } from "../trip-dialog";
import { AddItineraryItemButton } from "./itinerary-dialog";
import { ItineraryList } from "./itinerary-list";
import { PackingLists } from "./packing-lists";
import { Card, CardContent } from "@/components/ui/card";

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export default async function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [trip, candidates] = await Promise.all([getTripDetail(id), getDuplicateCandidates()]);

  if (!trip) notFound();

  const dateRange =
    trip.startDate && trip.endDate
      ? `${formatDate(trip.startDate)} – ${formatDate(trip.endDate)}`
      : trip.startDate
        ? formatDate(trip.startDate)
        : null;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{trip.name}</h1>
          <p className="text-muted-foreground text-sm">
            {[trip.destination, dateRange].filter(Boolean).join(" · ") || "No details yet"}
          </p>
        </div>
        <EditTripButton trip={trip} />
      </div>

      {trip.notes && (
        <Card>
          <CardContent className="py-3 text-sm">{trip.notes}</CardContent>
        </Card>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Itinerary</h2>
          <AddItineraryItemButton tripId={trip.id} />
        </div>
        <ItineraryList items={trip.itinerary} tripId={trip.id} />
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold tracking-tight">Packing Lists</h2>
        <PackingLists tripId={trip.id} lists={trip.packingLists} candidates={candidates} />
      </div>
    </div>
  );
}
