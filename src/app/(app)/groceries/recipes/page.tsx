import { getRecipes, getPantryNames } from "./queries";
import { RecipeList } from "./recipe-list";
import { AddRecipeButton } from "./recipe-form-sheet";

export default async function RecipesPage() {
  const [{ recipes, allTags }, pantryNames] = await Promise.all([getRecipes(), getPantryNames()]);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Recipes</h1>
          <p className="text-muted-foreground text-sm">{recipes.length} recipes</p>
        </div>
        <AddRecipeButton allTags={allTags} />
      </div>
      <RecipeList recipes={recipes} allTags={allTags} pantryNames={pantryNames} />
    </div>
  );
}
