import { notFound } from "next/navigation";
import { getRecipe, getPantryNames, getRecipes } from "../queries";
import { isOnHand } from "../../ingredient-match";
import { EditRecipeButton } from "../recipe-form-sheet";
import { DeleteRecipeButton } from "../delete-recipe-button";
import { AddMissingButton } from "../add-missing-button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

export default async function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [recipe, pantryNames, { allTags }] = await Promise.all([
    getRecipe(id),
    getPantryNames(),
    getRecipes(),
  ]);

  if (!recipe) notFound();

  const totalMinutes = (recipe.prepMinutes ?? 0) + (recipe.cookMinutes ?? 0);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{recipe.title}</h1>
          {recipe.description && <p className="text-muted-foreground text-sm">{recipe.description}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <EditRecipeButton recipe={recipe} allTags={allTags} />
          <DeleteRecipeButton id={recipe.id} title={recipe.title} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {totalMinutes > 0 && (
          <span className="text-muted-foreground text-xs">
            {recipe.prepMinutes ? `${recipe.prepMinutes} min prep` : ""}
            {recipe.prepMinutes && recipe.cookMinutes ? " · " : ""}
            {recipe.cookMinutes ? `${recipe.cookMinutes} min cook` : ""}
          </span>
        )}
        {recipe.servings && <span className="text-muted-foreground text-xs">Serves {recipe.servings}</span>}
        {recipe.tags.map((tag) => (
          <Badge key={tag.id} variant="outline" className="text-[10px]" style={{ borderColor: tag.color, color: tag.color }}>
            {tag.name}
          </Badge>
        ))}
      </div>

      <Card>
        <CardContent className="space-y-3 py-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">Ingredients</h2>
            <AddMissingButton recipeId={recipe.id} />
          </div>
          <div className="space-y-1">
            {recipe.ingredients.map((ing) => {
              const onHand = isOnHand(ing.name, pantryNames);
              return (
                <label key={ing.id} className="flex items-center gap-2.5 text-sm">
                  <Checkbox checked={onHand} disabled />
                  <span className={onHand ? "" : "text-muted-foreground"}>
                    {ing.name}
                    {ing.quantity ? ` — ${ing.quantity}` : ""}
                  </span>
                </label>
              );
            })}
            {recipe.ingredients.length === 0 && (
              <p className="text-muted-foreground text-sm">No ingredients listed.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2 py-4">
          <h2 className="text-sm font-semibold">Instructions</h2>
          <p className="text-sm whitespace-pre-wrap">{recipe.instructions}</p>
        </CardContent>
      </Card>

      {(recipe.source || recipe.notes) && (
        <Card>
          <CardContent className="space-y-1 py-4 text-sm">
            {recipe.source && <p className="text-muted-foreground">Source: {recipe.source}</p>}
            {recipe.notes && <p>{recipe.notes}</p>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
