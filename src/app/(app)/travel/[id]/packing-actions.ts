"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export async function getDuplicateCandidates() {
  return db.packingList.findMany({
    where: { type: "TRAVEL" },
    include: { trip: true, items: true },
    orderBy: { name: "asc" },
  });
}

export async function createPackingList(tripId: string, name: string, duplicateFromId?: string) {
  if (duplicateFromId) {
    const source = await db.packingList.findUnique({ where: { id: duplicateFromId }, include: { items: true } });
    await db.packingList.create({
      data: {
        tripId,
        type: "TRAVEL",
        name,
        items: { create: source?.items.map((i) => ({ text: i.text, subcategory: i.subcategory })) ?? [] },
      },
    });
  } else {
    await db.packingList.create({ data: { tripId, type: "TRAVEL", name } });
  }
  revalidatePath(`/travel/${tripId}`);
}

export async function deletePackingList(id: string, tripId: string) {
  await db.packingList.delete({ where: { id } });
  revalidatePath(`/travel/${tripId}`);
}

export async function createPackingItem(listId: string, tripId: string, text: string) {
  await db.packingItem.create({ data: { listId, text } });
  revalidatePath(`/travel/${tripId}`);
}

export async function togglePackingItem(id: string, tripId: string, checked: boolean) {
  await db.packingItem.update({ where: { id }, data: { checked } });
  revalidatePath(`/travel/${tripId}`);
}

export async function deletePackingItem(id: string, tripId: string) {
  await db.packingItem.delete({ where: { id } });
  revalidatePath(`/travel/${tripId}`);
}
