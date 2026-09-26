import { notFound } from "next/navigation";
import { getTripDetail } from "./queries";
import { getDuplicateCandidates } from "./packing-actions";
import { EditTripButton } from "../trip-dialog";
import { AddItineraryItemButton } from "./itinerary-dialog";
import { ItineraryList } from "./itinerary-list";
import { PackingLists } from "./packing-lists";
import { Card, CardContent } from "@/components/ui/card";
import { ExportButton } from "@/components/export-button";
import { dateOnly, detailRows, yesNo } from "@/lib/export";

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

  const exportSheets = [
    {
      name: "Trip",
      rows: detailRows({
        Trip: trip.name,
        Destination: trip.destination,
        Start: dateOnly(trip.startDate),
        End: dateOnly(trip.endDate),
        Notes: trip.notes,
      }),
    },
    {
      name: "Itinerary",
      rows: trip.itinerary.map((i) => ({
        Date: dateOnly(i.date),
        Time: i.time,
        Description: i.description,
        Location: i.location,
      })),
    },
    {
      name: "Packing",
      rows: trip.packingLists.flatMap((list) =>
        list.items.map((item) => ({
          List: list.name,
          Item: item.text,
          Category: item.subcategory,
          Packed: yesNo(item.checked),
        })),
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{trip.name}</h1>
          <p className="text-muted-foreground text-sm">
            {[trip.destination, dateRange].filter(Boolean).join(" · ") || "No details yet"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ExportButton filename={`trip-${trip.name}`} sheets={exportSheets} />
          <EditTripButton trip={trip} />
        </div>
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
