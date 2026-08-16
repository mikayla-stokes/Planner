import { db } from "@/lib/db";

export async function getTrips() {
  return db.trip.findMany({
    orderBy: [{ startDate: "asc" }, { createdAt: "desc" }],
  });
}
