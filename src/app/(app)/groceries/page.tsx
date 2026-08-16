import { getGroceryItems } from "./queries";
import { GroceryList } from "./grocery-list";

export default async function GroceryListPage() {
  const items = await getGroceryItems();
  const openCount = items.filter((i) => !i.checked).length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Grocery List</h1>
        <p className="text-muted-foreground text-sm">{openCount} to get</p>
      </div>
      <GroceryList items={items} />
    </div>
  );
}
