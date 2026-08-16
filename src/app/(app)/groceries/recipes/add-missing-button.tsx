"use client";

import { useState, useTransition } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addMissingIngredientsToGroceryList } from "./actions";

export function AddMissingButton({ recipeId }: { recipeId: string }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<number | null>(null);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="gap-1.5"
      disabled={pending}
      onClick={() => {
        setResult(null);
        startTransition(async () => {
          const { added } = await addMissingIngredientsToGroceryList(recipeId);
          setResult(added);
        });
      }}
    >
      <ShoppingCart className="size-3.5" />
      {result !== null ? `Added ${result} item${result === 1 ? "" : "s"}` : "Add missing ingredients"}
    </Button>
  );
}
