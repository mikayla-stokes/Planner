import { db } from "@/lib/db";

export async function getWeekEntries(weekStart: Date, weekEnd: Date) {
  return db.mealPlanEntry.findMany({
    where: { date: { gte: weekStart, lte: weekEnd } },
    include: { recipe: { select: { id: true, title: true } } },
  });
}

export async function getRecipeOptions() {
  return db.recipe.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } });
}
