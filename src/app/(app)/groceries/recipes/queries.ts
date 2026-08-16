import { db } from "@/lib/db";
import { getAllTags, getEntityTags } from "@/lib/tag-actions";

const ENTITY_TYPE = "Recipe";

export async function getRecipes() {
  const [recipes, allTags] = await Promise.all([
    db.recipe.findMany({
      include: { ingredients: true },
      orderBy: { createdAt: "desc" },
    }),
    getAllTags(),
  ]);
  const tagsByRecipe = await getEntityTags(
    ENTITY_TYPE,
    recipes.map((r) => r.id),
  );
  return {
    recipes: recipes.map((r) => ({ ...r, tags: tagsByRecipe.get(r.id) ?? [] })),
    allTags,
  };
}

export async function getRecipe(id: string) {
  const recipe = await db.recipe.findUnique({ where: { id }, include: { ingredients: true } });
  if (!recipe) return null;
  const tagsByRecipe = await getEntityTags(ENTITY_TYPE, [id]);
  return { ...recipe, tags: tagsByRecipe.get(id) ?? [] };
}

export async function getPantryNames() {
  const items = await db.pantryItem.findMany({ select: { name: true } });
  return items.map((i) => i.name);
}
