"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export async function updateWeddingNotes(id: string, notes: string) {
  await db.wedding.update({ where: { id }, data: { notes: notes.trim() || null } });
  revalidatePath("/wedding");
}
