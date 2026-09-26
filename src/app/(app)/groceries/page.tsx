import { getGroceryItems } from "./queries";
import { GroceryList } from "./grocery-list";
import { ExportButton } from "@/components/export-button";
import { yesNo } from "@/lib/export";

export default async function GroceryListPage() {
  const items = await getGroceryItems();
  const openCount = items.filter((i) => !i.checked).length;

  const exportSheets = [
    {
      name: "Grocery List",
      rows: items.map((i) => ({ Item: i.name, Quantity: i.quantity, "Got It": yesNo(i.checked), Added: i.createdAt })),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Grocery List</h1>
          <p className="text-muted-foreground text-sm">{openCount} to get</p>
        </div>
        <ExportButton filename="grocery-list" sheets={exportSheets} />
      </div>
      <GroceryList items={items} />
    </div>
  );
}
