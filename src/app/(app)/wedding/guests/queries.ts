import { db } from "@/lib/db";

export async function getGuests() {
  return db.guest.findMany({
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    include: { table: true },
  });
}

export async function getSeatingTables() {
  return db.seatingTable.findMany({ orderBy: { name: "asc" } });
}
