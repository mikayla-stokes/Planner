"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { todayDateOnly } from "./date-utils";

export type CheckInInput = {
  profileId: string;
  energy: number;
  mood: number;
  need?: string;
  want?: string;
  verse?: string;
};

export async function upsertTodayCheckIn(input: CheckInInput) {
  const date = todayDateOnly();
  const data = {
    energy: input.energy,
    mood: input.mood,
    need: input.need || null,
    want: input.want || null,
    verse: input.verse || null,
  };
  await db.dailyCheckIn.upsert({
    where: { profileId_date: { profileId: input.profileId, date } },
    update: data,
    create: { profileId: input.profileId, date, ...data },
  });
  revalidatePath("/relationship");
}
