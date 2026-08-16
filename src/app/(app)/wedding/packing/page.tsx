import { db } from "@/lib/db";
import { PackingListView } from "./packing-list-view";

export default async function PackingPage() {
  const lists = await db.packingList.findMany({
    // Scoped to the wedding-specific list types — PackingList is also reused by
    // Travel (type "TRAVEL", tripId set), which must not show up here.
    where: { type: { in: ["WEDDING", "HONEYMOON", "BACHELORETTE"] } },
    // cuids are time-ordered, so sorting items by id keeps a stable order
    // matching when they were added, instead of shifting on every render.
    include: { items: { orderBy: { id: "asc" } } },
    orderBy: { type: "asc" },
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Packing Lists</h1>
        <p className="text-muted-foreground text-sm">Wedding, honeymoon, and bachelorette weekend.</p>
      </div>
      <PackingListView lists={lists} />
    </div>
  );
}
