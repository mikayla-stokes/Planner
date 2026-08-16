"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import type { CalendarCategory } from "@/generated/prisma/enums";

export type EventInput = {
  title: string;
  date: string; // "YYYY-MM-DD" from <input type="date">
  time?: string;
  category: CalendarCategory;
  location?: string;
  notes?: string;
};

// Constructed directly at UTC midnight from the date string in one step.
// Re-deriving it through Date.getFullYear()/getMonth()/getDate() (local-time
// getters) on an already-UTC Date would shift it a day whenever the server's
// local timezone is behind UTC — that's the bug this avoids.
function dateOnlyUTC(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

function clean(input: EventInput) {
  return {
    title: input.title,
    date: dateOnlyUTC(input.date),
    time: input.time?.trim() || null,
    category: input.category,
    location: input.location?.trim() || null,
    notes: input.notes?.trim() || null,
  };
}

export async function createEvent(input: EventInput) {
  await db.calendarEvent.create({ data: clean(input) });
  revalidatePath("/calendar");
  revalidatePath("/");
}

export async function updateEvent(id: string, input: EventInput) {
  await db.calendarEvent.update({ where: { id }, data: clean(input) });
  revalidatePath("/calendar");
  revalidatePath("/");
}

export async function deleteEvent(id: string) {
  await db.calendarEvent.delete({ where: { id } });
  revalidatePath("/calendar");
  revalidatePath("/");
}
