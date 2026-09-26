import { db } from "@/lib/db";
import { PackingListView } from "./packing-list-view";
import { ExportButton } from "@/components/export-button";
import { yesNo } from "@/lib/export";

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

  const exportSheets = lists.map((list) => ({
    name: list.name,
    rows: list.items.map((item) => ({ Item: item.text, Category: item.subcategory, Packed: yesNo(item.checked) })),
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Packing Lists</h1>
          <p className="text-muted-foreground text-sm">Wedding, honeymoon, and bachelorette weekend.</p>
        </div>
        <ExportButton filename="wedding-packing" sheets={exportSheets} />
      </div>
      <PackingListView lists={lists} />
    </div>
  );
}
