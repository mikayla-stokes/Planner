"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { setEntityTags } from "@/lib/tag-actions";
import { isOnHand } from "../ingredient-match";

const ENTITY_TYPE = "Recipe";

export type RecipeInput = {
  title: string;
  description?: string;
  instructions: string;
  prepMinutes?: number;
  cookMinutes?: number;
  servings?: number;
  source?: string;
  notes?: string;
  ingredients: { name: string; quantity?: string }[];
  tagIds: string[];
};

function cleanRecipeFields(input: RecipeInput) {
  return {
    title: input.title,
    description: input.description || null,
    instructions: input.instructions,
    prepMinutes: input.prepMinutes ?? null,
    cookMinutes: input.cookMinutes ?? null,
    servings: input.servings ?? null,
    source: input.source || null,
    notes: input.notes || null,
  };
}

function cleanIngredients(ingredients: RecipeInput["ingredients"]) {
  return ingredients
    .map((i) => ({ name: i.name.trim(), quantity: i.quantity?.trim() || null }))
    .filter((i) => i.name.length > 0);
}

export async function createRecipe(input: RecipeInput) {
  const recipe = await db.recipe.create({
    data: {
      ...cleanRecipeFields(input),
      ingredients: { create: cleanIngredients(input.ingredients) },
    },
  });
  await setEntityTags(ENTITY_TYPE, recipe.id, input.tagIds);
  revalidatePath("/groceries/recipes");
  return recipe.id;
}

export async function updateRecipe(id: string, input: RecipeInput) {
  await db.recipeIngredient.deleteMany({ where: { recipeId: id } });
  await db.recipe.update({
    where: { id },
    data: {
      ...cleanRecipeFields(input),
      ingredients: { create: cleanIngredients(input.ingredients) },
    },
  });
  await setEntityTags(ENTITY_TYPE, id, input.tagIds);
  revalidatePath("/groceries/recipes");
  revalidatePath(`/groceries/recipes/${id}`);
}

export async function deleteRecipe(id: string) {
  await db.entityTag.deleteMany({ where: { entityType: ENTITY_TYPE, entityId: id } });
  await db.recipe.delete({ where: { id } }); // cascades to RecipeIngredient
  revalidatePath("/groceries/recipes");
}

export async function addMissingIngredientsToGroceryList(recipeId: string) {
  const [recipe, pantryItems, groceryItems] = await Promise.all([
    db.recipe.findUnique({ where: { id: recipeId }, include: { ingredients: true } }),
    db.pantryItem.findMany({ select: { name: true } }),
    db.groceryListItem.findMany({ select: { name: true } }),
  ]);
  if (!recipe) return { added: 0 };

  const pantryNames = pantryItems.map((p) => p.name);
  const groceryNames = groceryItems.map((g) => g.name);

  const toAdd = recipe.ingredients.filter(
    (ing) => !isOnHand(ing.name, pantryNames) && !isOnHand(ing.name, groceryNames),
  );

  if (toAdd.length > 0) {
    await db.groceryListItem.createMany({
      data: toAdd.map((ing) => ({ name: ing.name, quantity: ing.quantity })),
    });
  }

  revalidatePath("/groceries");
  return { added: toAdd.length };
}
