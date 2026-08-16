"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export type CategoryInput = {
  name: string;
  monthlyBudget: number;
  notes?: string;
};

function cleanCategory(input: CategoryInput) {
  return {
    name: input.name,
    monthlyBudget: input.monthlyBudget,
    notes: input.notes || null,
  };
}

export async function createCategory(input: CategoryInput) {
  await db.financeCategory.create({ data: cleanCategory(input) });
  revalidatePath("/finance");
}

export async function updateCategory(id: string, input: CategoryInput) {
  await db.financeCategory.update({ where: { id }, data: cleanCategory(input) });
  revalidatePath("/finance");
}

export async function deleteCategory(id: string) {
  await db.financeCategory.delete({ where: { id } });
  revalidatePath("/finance");
}
