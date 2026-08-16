"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export async function createGroceryItem(input: { name: string; quantity?: string }) {
  await db.groceryListItem.create({ data: { name: input.name, quantity: input.quantity || null } });
  revalidatePath("/groceries");
}

export async function toggleGroceryItem(id: string, checked: boolean) {
  await db.groceryListItem.update({ where: { id }, data: { checked } });
  revalidatePath("/groceries");
}

export async function deleteGroceryItem(id: string) {
  await db.groceryListItem.delete({ where: { id } });
  revalidatePath("/groceries");
}

export async function clearCheckedGroceryItems() {
  await db.groceryListItem.deleteMany({ where: { checked: true } });
  revalidatePath("/groceries");
}
