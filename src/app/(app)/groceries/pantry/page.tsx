import { getPantryItems } from "./queries";
import { AddPantryItemButton, EditPantryItemButton } from "./pantry-item-dialog";
import { Card, CardContent } from "@/components/ui/card";

export default async function PantryPage() {
  const items = await getPantryItems();

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pantry</h1>
          <p className="text-muted-foreground text-sm">{items.length} items on hand</p>
        </div>
        <AddPantryItemButton />
      </div>
      <Card>
        <CardContent className="divide-y py-0">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-2 py-2">
              <div className="min-w-0">
                <span className="text-sm">{item.name}</span>
                {item.quantity && <span className="text-muted-foreground ml-2 text-xs">{item.quantity}</span>}
                {item.notes && <p className="text-muted-foreground text-xs">{item.notes}</p>}
              </div>
              <EditPantryItemButton item={item} />
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-muted-foreground py-8 text-center text-sm">Your pantry is empty.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
