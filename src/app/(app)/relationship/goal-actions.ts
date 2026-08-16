"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import type { GoalPeriod } from "@/generated/prisma/enums";

export type GoalInput = {
  title: string;
  notes?: string;
  period: GoalPeriod;
  year: number;
  quarter?: number | null;
  progress: number;
  profileId?: string | null;
};

function clean(input: GoalInput) {
  return {
    title: input.title,
    notes: input.notes || null,
    period: input.period,
    year: input.year,
    quarter: input.period === "QUARTERLY" ? (input.quarter ?? 1) : null,
    progress: Math.max(0, Math.min(100, input.progress)),
    completed: input.progress >= 100,
    profileId: input.profileId || null,
  };
}

export async function createGoal(input: GoalInput) {
  await db.goal.create({ data: clean(input) });
  revalidatePath("/relationship");
}

export async function updateGoal(id: string, input: GoalInput) {
  await db.goal.update({ where: { id }, data: clean(input) });
  revalidatePath("/relationship");
}

export async function deleteGoal(id: string) {
  await db.goal.delete({ where: { id } });
  revalidatePath("/relationship");
}
