import { db } from "@/lib/db";

export async function getExpenses() {
  // category is only ever displayed by name, so select just that — also
  // avoids pulling the Decimal monthlyBudget field into the nested object,
  // which can't cross the Server -> Client boundary un-serialized.
  return db.financeExpense.findMany({
    include: { category: { select: { id: true, name: true } }, paidBy: true },
    orderBy: { date: "desc" },
  });
}

export async function getCategories() {
  // Only id/name needed for the expense-form Select — avoids passing the
  // Decimal monthlyBudget field across the Server -> Client boundary.
  return db.financeCategory.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });
}

export async function getProfiles() {
  return db.profile.findMany({ orderBy: { name: "asc" } });
}
