import { db } from "@/lib/db";

function monthRange(d: Date = new Date()) {
  const start = new Date(Date.UTC(d.getFullYear(), d.getMonth(), 1));
  const end = new Date(Date.UTC(d.getFullYear(), d.getMonth() + 1, 0));
  return { start, end };
}

export async function getCategories() {
  return db.financeCategory.findMany({ orderBy: { name: "asc" } });
}

export async function getExpensesThisMonth() {
  const { start, end } = monthRange();
  return db.financeExpense.findMany({
    where: { date: { gte: start, lte: end } },
    include: { category: true },
  });
}
