"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { togglePackingItem } from "./actions";
import { AddPackingItemButton, EditPackingItemButton } from "./packing-item-dialog";

type List = {
  id: string;
  type: string;
  name: string;
  items: { id: string; text: string; subcategory: string | null; checked: boolean }[];
};

const LABELS: Record<string, string> = {
  WEDDING: "Wedding",
  HONEYMOON: "Honeymoon",
  BACHELORETTE: "Bachelorette",
};

function Item({ item }: { item: List["items"][number] }) {
  const [checked, setChecked] = useState(item.checked);
  const [pending, startTransition] = useTransition();

  return (
    <div className={cn("flex items-center gap-2.5 py-1", pending && "opacity-60")}>
      <Checkbox
        checked={checked}
        onCheckedChange={(v) => {
          const next = v === true;
          setChecked(next);
          startTransition(async () => {
            try {
              await togglePackingItem(item.id, next);
            } catch {
              setChecked(!next); // save failed — don't leave the UI showing an unsaved state
            }
          });
        }}
      />
      <span className={cn("flex-1 text-sm", checked && "text-muted-foreground line-through")}>
        {item.text}
      </span>
      <EditPackingItemButton item={item} />
    </div>
  );
}

export function PackingListView({ lists }: { lists: List[] }) {
  if (lists.length === 0) {
    return <p className="text-muted-foreground py-8 text-center text-sm">No packing lists yet.</p>;
  }

  return (
    <Tabs defaultValue={lists[0].type}>
      <TabsList>
        {lists.map((list) => (
          <TabsTrigger key={list.id} value={list.type}>
            {LABELS[list.type] ?? list.name}
          </TabsTrigger>
        ))}
      </TabsList>
      {lists.map((list) => {
        const groups = new Map<string, List["items"]>();
        for (const item of list.items) {
          const key = item.subcategory ?? "";
          if (!groups.has(key)) groups.set(key, []);
          groups.get(key)!.push(item);
        }

        return (
          <TabsContent key={list.id} value={list.type} className="space-y-3">
            {[...groups.entries()].map(([subcategory, items]) => (
              <Card key={subcategory || "_default"}>
                {subcategory && (
                  <CardHeader className="pb-1">
                    <CardTitle className="text-sm">{subcategory}</CardTitle>
                  </CardHeader>
                )}
                <CardContent className="pt-2">
                  {items.map((item) => (
                    <Item key={item.id} item={item} />
                  ))}
                  <AddPackingItemButton listId={list.id} defaultSubcategory={subcategory || undefined} />
                </CardContent>
              </Card>
            ))}
            <AddPackingItemButton listId={list.id} />
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
