"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export type ExpenseInput = {
  date: string; // "YYYY-MM-DD"
  amount: number;
  categoryId?: string | null;
  description?: string;
  paidById?: string | null;
};

// FinanceExpense.date is a Postgres `date` column (no time-of-day, no
// timezone), so it must be constructed at UTC midnight or a local-timezone
// Date can serialize to the previous/next day once stored.
function dateOnlyUTC(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

export async function createExpense(input: ExpenseInput) {
  await db.financeExpense.create({
    data: {
      date: dateOnlyUTC(input.date),
      amount: input.amount,
      categoryId: input.categoryId || null,
      description: input.description || null,
      paidById: input.paidById || null,
    },
  });
  revalidatePath("/finance/expenses");
  revalidatePath("/finance");
}

export async function deleteExpense(id: string) {
  await db.financeExpense.delete({ where: { id } });
  revalidatePath("/finance/expenses");
  revalidatePath("/finance");
}
