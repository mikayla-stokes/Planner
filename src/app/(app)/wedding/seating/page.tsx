import { db } from "@/lib/db";
import { SeatingBoard } from "./seating-board";

export default async function SeatingPage() {
  const [tables, guests] = await Promise.all([
    db.seatingTable.findMany({ orderBy: { name: "asc" } }),
    db.guest.findMany({ orderBy: [{ lastName: "asc" }, { firstName: "asc" }] }),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Seating Chart</h1>
        <p className="text-muted-foreground text-sm">{tables.length} tables</p>
      </div>
      <SeatingBoard tables={tables} guests={guests} />
    </div>
  );
}
