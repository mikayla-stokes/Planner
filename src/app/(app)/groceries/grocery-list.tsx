"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  createGroceryItem,
  toggleGroceryItem,
  deleteGroceryItem,
  clearCheckedGroceryItems,
} from "./actions";
import type { getGroceryItems } from "./queries";

type Items = Awaited<ReturnType<typeof getGroceryItems>>;

function AddItemRow() {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [pending, startTransition] = useTransition();

  function submit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    startTransition(async () => {
      await createGroceryItem({ name: trimmed, quantity: quantity.trim() || undefined });
      setName("");
      setQuantity("");
    });
  }

  return (
    <div className="flex gap-1.5">
      <Input
        placeholder="Add an item…"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submit();
          }
        }}
        className="flex-1"
      />
      <Input
        placeholder="Qty"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submit();
          }
        }}
        className="w-20"
      />
      <Button type="button" size="icon" disabled={!name.trim() || pending} onClick={submit} aria-label="Add item">
        <Plus className="size-4" />
      </Button>
    </div>
  );
}

function ItemRow({ item }: { item: Items[number] }) {
  const [checked, setChecked] = useState(item.checked);
  const [pending, startTransition] = useTransition();

  return (
    <div className={cn("flex items-center gap-2.5 py-1.5", pending && "opacity-60")}>
      <Checkbox
        checked={checked}
        onCheckedChange={(v) => {
          const next = v === true;
          setChecked(next);
          startTransition(async () => {
            try {
              await toggleGroceryItem(item.id, next);
            } catch {
              setChecked(!next);
            }
          });
        }}
      />
      <span className={cn("flex-1 text-sm", checked && "text-muted-foreground line-through")}>
        {item.name}
      </span>
      {item.quantity && <span className="text-muted-foreground text-xs">{item.quantity}</span>}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-destructive size-7"
        aria-label={`Remove ${item.name}`}
        onClick={() => startTransition(async () => await deleteGroceryItem(item.id))}
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  );
}

export function GroceryList({ items }: { items: Items }) {
  const [, startTransition] = useTransition();
  const hasChecked = items.some((i) => i.checked);

  return (
    <div className="space-y-3">
      <AddItemRow />
      <Card>
        <CardContent className="divide-y py-0">
          {items.map((item) => (
            <ItemRow key={item.id} item={item} />
          ))}
          {items.length === 0 && (
            <p className="text-muted-foreground py-8 text-center text-sm">Your grocery list is empty.</p>
          )}
        </CardContent>
      </Card>
      {hasChecked && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => startTransition(async () => await clearCheckedGroceryItems())}
          >
            Clear checked
          </Button>
        </div>
      )}
    </div>
  );
}
