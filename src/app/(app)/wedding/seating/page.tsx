import { db } from "@/lib/db";
import { SeatingBoard } from "./seating-board";
import { ExportButton } from "@/components/export-button";

export default async function SeatingPage() {
  const [tables, guests] = await Promise.all([
    db.seatingTable.findMany({ orderBy: { name: "asc" } }),
    db.guest.findMany({ orderBy: [{ lastName: "asc" }, { firstName: "asc" }] }),
  ]);

  const guestName = (g: (typeof guests)[number]) => `${g.firstName} ${g.lastName}`;
  const exportSheets = [
    {
      name: "Seating",
      rows: [
        ...tables.flatMap((t) =>
          guests.filter((g) => g.tableId === t.id).map((g) => ({ Table: t.name, Guest: guestName(g) })),
        ),
        ...guests.filter((g) => !g.tableId).map((g) => ({ Table: "Unassigned", Guest: guestName(g) })),
      ],
    },
    {
      name: "Tables",
      rows: tables.map((t) => ({ Table: t.name, Guests: guests.filter((g) => g.tableId === t.id).length })),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Seating Chart</h1>
          <p className="text-muted-foreground text-sm">{tables.length} tables</p>
        </div>
        <ExportButton filename="wedding-seating" sheets={exportSheets} />
      </div>
      <SeatingBoard tables={tables} guests={guests} />
    </div>
  );
}
