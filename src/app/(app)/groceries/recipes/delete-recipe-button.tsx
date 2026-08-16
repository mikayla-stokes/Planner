"use client";

import { useRouter } from "next/navigation";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { deleteRecipe } from "./actions";

export function DeleteRecipeButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();

  return (
    <ConfirmDeleteButton
      itemLabel={title}
      size="sm"
      onConfirm={async () => {
        await deleteRecipe(id);
        router.push("/groceries/recipes");
      }}
    />
  );
}
