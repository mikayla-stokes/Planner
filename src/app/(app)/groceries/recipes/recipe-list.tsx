"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { isOnHand } from "../ingredient-match";
import type { getRecipes } from "./queries";

type Recipes = Awaited<ReturnType<typeof getRecipes>>["recipes"];
type Tags = Awaited<ReturnType<typeof getRecipes>>["allTags"];

export function RecipeList({
  recipes,
  allTags,
  pantryNames,
}: {
  recipes: Recipes;
  allTags: Tags;
  pantryNames: string[];
}) {
  const [query, setQuery] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [canMakeOnly, setCanMakeOnly] = useState(false);

  const withMatch = useMemo(
    () =>
      recipes.map((r) => {
        const matched = r.ingredients.filter((i) => isOnHand(i.name, pantryNames)).length;
        return { ...r, matched, total: r.ingredients.length };
      }),
    [recipes, pantryNames],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return withMatch
      .filter((r) => !q || r.title.toLowerCase().includes(q))
      .filter((r) => selectedTagIds.length === 0 || r.tags.some((t) => selectedTagIds.includes(t.id)))
      .filter((r) => !canMakeOnly || (r.total > 0 && r.matched === r.total))
      .sort((a, b) => {
        const aPct = a.total === 0 ? 0 : a.matched / a.total;
        const bPct = b.total === 0 ? 0 : b.matched / b.total;
        return bPct - aPct;
      });
  }, [withMatch, query, selectedTagIds, canMakeOnly]);

  function toggleTag(id: string) {
    setSelectedTagIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  }

  return (
    <div className="space-y-3">
      <Input placeholder="Search recipes…" value={query} onChange={(e) => setQuery(e.target.value)} />
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {allTags.map((tag) => {
            const selected = selectedTagIds.includes(tag.id);
            return (
              <button type="button" key={tag.id} onClick={() => toggleTag(tag.id)} className="cursor-pointer">
                <Badge
                  variant={selected ? "default" : "outline"}
                  style={selected ? { backgroundColor: tag.color, color: "#fff", borderColor: tag.color } : undefined}
                >
                  {tag.name}
                </Badge>
              </button>
            );
          })}
        </div>
      )}
      <Button
        type="button"
        variant={canMakeOnly ? "default" : "outline"}
        size="sm"
        onClick={() => setCanMakeOnly((v) => !v)}
      >
        Can make now
      </Button>

      <div className="space-y-2">
        {filtered.map((recipe) => (
          <Link key={recipe.id} href={`/groceries/recipes/${recipe.id}`}>
            <Card className="hover:border-primary/40 transition-colors">
              <CardContent className="space-y-1.5 py-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium">{recipe.title}</span>
                  {recipe.total > 0 && (
                    <Badge variant={recipe.matched === recipe.total ? "default" : "outline"} className="shrink-0 text-[10px]">
                      {recipe.matched}/{recipe.total} on hand
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {(recipe.prepMinutes || recipe.cookMinutes) && (
                    <span className="text-muted-foreground text-xs">
                      {(recipe.prepMinutes ?? 0) + (recipe.cookMinutes ?? 0)} min
                    </span>
                  )}
                  {recipe.tags.map((tag) => (
                    <Badge key={tag.id} variant="outline" className="text-[10px]" style={{ borderColor: tag.color, color: tag.color }}>
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="text-muted-foreground py-8 text-center text-sm">No recipes match.</p>
        )}
      </div>
    </div>
  );
}
