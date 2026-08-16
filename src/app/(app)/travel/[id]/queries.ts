import { db } from "@/lib/db";

export async function getTripDetail(id: string) {
  return db.trip.findUnique({
    where: { id },
    include: {
      itinerary: { orderBy: { sortOrder: "asc" } },
      packingLists: { include: { items: { orderBy: { id: "asc" } } }, orderBy: { name: "asc" } },
    },
  });
}
