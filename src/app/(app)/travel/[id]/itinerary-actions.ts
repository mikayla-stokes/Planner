"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export type ItineraryItemInput = {
  date?: string; // yyyy-mm-dd
  time?: string;
  description: string;
  location?: string;
};

function clean(input: ItineraryItemInput) {
  return {
    date: input.date ? new Date(input.date) : null,
    time: input.time || null,
    description: input.description,
    location: input.location || null,
  };
}

export async function createItineraryItem(tripId: string, input: ItineraryItemInput) {
  const maxSort = await db.itineraryItem.aggregate({ where: { tripId }, _max: { sortOrder: true } });
  await db.itineraryItem.create({
    data: { tripId, ...clean(input), sortOrder: (maxSort._max.sortOrder ?? -1) + 1 },
  });
  revalidatePath(`/travel/${tripId}`);
}

export async function updateItineraryItem(id: string, tripId: string, input: ItineraryItemInput) {
  await db.itineraryItem.update({ where: { id }, data: clean(input) });
  revalidatePath(`/travel/${tripId}`);
}

export async function deleteItineraryItem(id: string, tripId: string) {
  await db.itineraryItem.delete({ where: { id } });
  revalidatePath(`/travel/${tripId}`);
}
