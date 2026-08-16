"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export type BudgetItemInput = {
  item: string;
  priorityLevel?: string;
  category: string;
  estimatedCost?: number;
  budget?: number;
  amountPaid: number;
  notes?: string;
};

function clean(input: BudgetItemInput) {
  const budget = input.budget ?? input.estimatedCost;
  return {
    item: input.item,
    priorityLevel: input.priorityLevel || null,
    category: input.category,
    estimatedCost: input.estimatedCost ?? null,
    budget: budget ?? null,
    amountPaid: input.amountPaid,
    amountRemaining: budget !== undefined ? budget - input.amountPaid : null,
    notes: input.notes || null,
  };
}

export async function createBudgetItem(input: BudgetItemInput) {
  await db.weddingBudgetItem.create({ data: clean(input) });
  revalidatePath("/wedding/budget");
  revalidatePath("/wedding");
}

export async function updateBudgetItem(id: string, input: BudgetItemInput) {
  await db.weddingBudgetItem.update({ where: { id }, data: clean(input) });
  revalidatePath("/wedding/budget");
  revalidatePath("/wedding");
}

export async function deleteBudgetItem(id: string) {
  await db.weddingBudgetItem.delete({ where: { id } });
  revalidatePath("/wedding/budget");
  revalidatePath("/wedding");
}
