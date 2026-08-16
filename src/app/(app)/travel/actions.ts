"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export type TripInput = {
  name: string;
  destination?: string;
  startDate?: string; // yyyy-mm-dd
  endDate?: string;
  notes?: string;
};

function clean(input: TripInput) {
  return {
    name: input.name,
    destination: input.destination || null,
    startDate: input.startDate ? new Date(input.startDate) : null,
    endDate: input.endDate ? new Date(input.endDate) : null,
    notes: input.notes || null,
  };
}

export async function createTrip(input: TripInput) {
  const trip = await db.trip.create({ data: clean(input) });
  revalidatePath("/travel");
  return trip.id;
}

export async function updateTrip(id: string, input: TripInput) {
  await db.trip.update({ where: { id }, data: clean(input) });
  revalidatePath("/travel");
  revalidatePath(`/travel/${id}`);
}

export async function deleteTrip(id: string) {
  await db.trip.delete({ where: { id } }); // cascades to itinerary + packing lists
  revalidatePath("/travel");
}
