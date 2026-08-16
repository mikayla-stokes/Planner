"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export type PantryItemInput = { name: string; quantity?: string; notes?: string };

function clean(input: PantryItemInput) {
  return {
    name: input.name,
    quantity: input.quantity || null,
    notes: input.notes || null,
  };
}

export async function createPantryItem(input: PantryItemInput) {
  await db.pantryItem.create({ data: clean(input) });
  revalidatePath("/groceries/pantry");
  revalidatePath("/groceries/recipes");
}

export async function updatePantryItem(id: string, input: PantryItemInput) {
  await db.pantryItem.update({ where: { id }, data: clean(input) });
  revalidatePath("/groceries/pantry");
  revalidatePath("/groceries/recipes");
}

export async function deletePantryItem(id: string) {
  await db.pantryItem.delete({ where: { id } });
  revalidatePath("/groceries/pantry");
  revalidatePath("/groceries/recipes");
}
