"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import type { Priority } from "@/generated/prisma/enums";

export type TaskInput = {
  title: string;
  notes?: string;
  priority?: Priority | null;
  dueDate?: string; // yyyy-mm-dd from <input type="date">
  profileId?: string | null;
};

function clean(input: TaskInput) {
  return {
    title: input.title,
    notes: input.notes || null,
    priority: input.priority || null,
    dueDate: input.dueDate ? new Date(input.dueDate) : null,
    profileId: input.profileId || null,
  };
}

export async function toggleTask(id: string, completed: boolean) {
  await db.task.update({ where: { id }, data: { completed } });
  revalidatePath("/todo");
  revalidatePath("/");
}

export async function createTask(input: TaskInput) {
  await db.task.create({ data: { ...clean(input), listType: "GENERAL" } });
  revalidatePath("/todo");
  revalidatePath("/");
}

export async function updateTask(id: string, input: TaskInput) {
  await db.task.update({ where: { id }, data: clean(input) });
  revalidatePath("/todo");
  revalidatePath("/");
}

export async function deleteTask(id: string) {
  await db.task.delete({ where: { id } });
  revalidatePath("/todo");
  revalidatePath("/");
}
