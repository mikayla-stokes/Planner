"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import type { Priority, RecurrenceFrequency } from "@/generated/prisma/enums";

// ---------- Chores ----------

export type ChoreInput = {
  title: string;
  notes?: string;
  frequency: RecurrenceFrequency;
  priority?: Priority | null;
  assigneeId?: string | null;
};

function cleanChore(input: ChoreInput) {
  return {
    title: input.title,
    notes: input.notes || null,
    frequency: input.frequency,
    priority: input.priority || null,
    assigneeId: input.assigneeId || null,
  };
}

export async function createChore(input: ChoreInput) {
  await db.chore.create({ data: cleanChore(input) });
  revalidatePath("/household");
  revalidatePath("/");
}

export async function updateChore(id: string, input: ChoreInput) {
  await db.chore.update({ where: { id }, data: cleanChore(input) });
  revalidatePath("/household");
  revalidatePath("/");
}

export async function deleteChore(id: string) {
  await db.chore.delete({ where: { id } });
  revalidatePath("/household");
  revalidatePath("/");
}

export async function markChoreDone(id: string) {
  await db.chore.update({ where: { id }, data: { lastCompletedAt: new Date() } });
  revalidatePath("/household");
  revalidatePath("/");
}

// ---------- Home Projects ----------

export type HomeProjectInput = {
  title: string;
  notes?: string;
  priority?: Priority | null;
  dueDate?: string; // yyyy-mm-dd
};

function cleanProject(input: HomeProjectInput) {
  return {
    title: input.title,
    notes: input.notes || null,
    priority: input.priority || null,
    dueDate: input.dueDate ? new Date(input.dueDate) : null,
  };
}

export async function toggleHomeProject(id: string, completed: boolean) {
  await db.homeProject.update({ where: { id }, data: { completed } });
  revalidatePath("/household");
  revalidatePath("/todo");
}

export async function createHomeProject(input: HomeProjectInput) {
  await db.homeProject.create({ data: cleanProject(input) });
  revalidatePath("/household");
  revalidatePath("/todo");
}

export async function updateHomeProject(id: string, input: HomeProjectInput) {
  await db.homeProject.update({ where: { id }, data: cleanProject(input) });
  revalidatePath("/household");
  revalidatePath("/todo");
}

export async function deleteHomeProject(id: string) {
  await db.homeProject.delete({ where: { id } });
  revalidatePath("/household");
  revalidatePath("/todo");
}
