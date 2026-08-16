"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { isOnHand } from "../ingredient-match";
import type { MealSlot } from "@/generated/prisma/enums";

export type MealSlotInput = {
  recipeId?: string | null;
  mealName?: string;
  notes?: string;
};

export async function setMealSlot(date: Date, slot: MealSlot, input: MealSlotInput) {
  const data = {
    recipeId: input.recipeId || null,
    mealName: input.recipeId ? null : input.mealName?.trim() || null,
    notes: input.notes?.trim() || null,
  };
  await db.mealPlanEntry.upsert({
    where: { date_slot: { date, slot } },
    create: { date, slot, ...data },
    update: data,
  });
  revalidatePath("/groceries/meal-plan");
}

export async function clearMealSlot(date: Date, slot: MealSlot) {
  await db.mealPlanEntry.deleteMany({ where: { date, slot } });
  revalidatePath("/groceries/meal-plan");
}

export async function addMissingIngredientsForWeek(weekStart: Date, weekEnd: Date) {
  const [entries, pantryItems, groceryItems] = await Promise.all([
    db.mealPlanEntry.findMany({
      where: { date: { gte: weekStart, lte: weekEnd }, recipeId: { not: null } },
      select: { recipeId: true },
    }),
    db.pantryItem.findMany({ select: { name: true } }),
    db.groceryListItem.findMany({ select: { name: true } }),
  ]);

  const recipeIds = [...new Set(entries.map((e) => e.recipeId!))];
  if (recipeIds.length === 0) return { added: 0 };

  const ingredients = await db.recipeIngredient.findMany({ where: { recipeId: { in: recipeIds } } });

  const seen = new Set<string>();
  const deduped: { name: string; quantity: string | null }[] = [];
  for (const ing of ingredients) {
    const key = ing.name.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    deduped.push({ name: ing.name, quantity: ing.quantity });
  }

  const pantryNames = pantryItems.map((p) => p.name);
  const groceryNames = groceryItems.map((g) => g.name);
  const toAdd = deduped.filter((ing) => !isOnHand(ing.name, pantryNames) && !isOnHand(ing.name, groceryNames));

  if (toAdd.length > 0) {
    await db.groceryListItem.createMany({
      data: toAdd.map((ing) => ({ name: ing.name, quantity: ing.quantity })),
    });
  }

  revalidatePath("/groceries");
  revalidatePath("/groceries/meal-plan");
  return { added: toAdd.length };
}
