import { getRecipes, getPantryNames } from "./queries";
import { RecipeList } from "./recipe-list";
import { AddRecipeButton } from "./recipe-form-sheet";
import { isOnHand } from "../ingredient-match";
import { ExportButton } from "@/components/export-button";
import { yesNo } from "@/lib/export";

export default async function RecipesPage() {
  const [{ recipes, allTags }, pantryNames] = await Promise.all([getRecipes(), getPantryNames()]);

  const exportSheets = [
    {
      name: "Recipes",
      rows: recipes.map((r) => ({
        Recipe: r.title,
        Description: r.description,
        Tags: r.tags.map((t) => t.name).join(", "),
        "Prep (min)": r.prepMinutes,
        "Cook (min)": r.cookMinutes,
        Servings: r.servings,
        Ingredients: r.ingredients.length,
        Instructions: r.instructions,
        Source: r.source,
        Notes: r.notes,
      })),
    },
    {
      name: "Ingredients",
      rows: recipes.flatMap((r) =>
        r.ingredients.map((ing) => ({
          Recipe: r.title,
          Ingredient: ing.name,
          Quantity: ing.quantity,
          "In Pantry": yesNo(isOnHand(ing.name, pantryNames)),
        })),
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Recipes</h1>
          <p className="text-muted-foreground text-sm">{recipes.length} recipes</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ExportButton filename="recipes" sheets={exportSheets} />
          <AddRecipeButton allTags={allTags} />
        </div>
      </div>
      <RecipeList recipes={recipes} allTags={allTags} pantryNames={pantryNames} />
    </div>
  );
}
