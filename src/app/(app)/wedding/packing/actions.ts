"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export async function togglePackingItem(id: string, checked: boolean) {
  await db.packingItem.update({ where: { id }, data: { checked } });
  revalidatePath("/wedding/packing");
}

export async function createPackingItem(input: { listId: string; text: string; subcategory?: string }) {
  await db.packingItem.create({
    data: { listId: input.listId, text: input.text, subcategory: input.subcategory || null },
  });
  revalidatePath("/wedding/packing");
}

export async function updatePackingItem(id: string, input: { text: string; subcategory?: string }) {
  await db.packingItem.update({
    where: { id },
    data: { text: input.text, subcategory: input.subcategory || null },
  });
  revalidatePath("/wedding/packing");
}

export async function deletePackingItem(id: string) {
  await db.packingItem.delete({ where: { id } });
  revalidatePath("/wedding/packing");
}
