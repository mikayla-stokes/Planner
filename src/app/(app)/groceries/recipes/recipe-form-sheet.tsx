"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TagPicker } from "@/components/tag-picker";
import { createRecipe, updateRecipe, type RecipeInput } from "./actions";
import type { getRecipe } from "./queries";

type ExistingRecipe = NonNullable<Awaited<ReturnType<typeof getRecipe>>>;
type Tag = { id: string; name: string; color: string };

type IngredientRow = { name: string; quantity: string };

type FormState = {
  title: string;
  description: string;
  instructions: string;
  prepMinutes: string;
  cookMinutes: string;
  servings: string;
  source: string;
  notes: string;
  ingredients: IngredientRow[];
  tagIds: string[];
};

function emptyForm(): FormState {
  return {
    title: "",
    description: "",
    instructions: "",
    prepMinutes: "",
    cookMinutes: "",
    servings: "",
    source: "",
    notes: "",
    ingredients: [{ name: "", quantity: "" }],
    tagIds: [],
  };
}

function recipeToForm(r: ExistingRecipe): FormState {
  return {
    title: r.title,
    description: r.description ?? "",
    instructions: r.instructions,
    prepMinutes: r.prepMinutes?.toString() ?? "",
    cookMinutes: r.cookMinutes?.toString() ?? "",
    servings: r.servings?.toString() ?? "",
    source: r.source ?? "",
    notes: r.notes ?? "",
    ingredients: r.ingredients.length > 0
      ? r.ingredients.map((i) => ({ name: i.name, quantity: i.quantity ?? "" }))
      : [{ name: "", quantity: "" }],
    tagIds: r.tags.map((t) => t.id),
  };
}

function toInput(form: FormState): RecipeInput {
  return {
    title: form.title,
    description: form.description,
    instructions: form.instructions,
    prepMinutes: form.prepMinutes ? Number(form.prepMinutes) : undefined,
    cookMinutes: form.cookMinutes ? Number(form.cookMinutes) : undefined,
    servings: form.servings ? Number(form.servings) : undefined,
    source: form.source,
    notes: form.notes,
    ingredients: form.ingredients,
    tagIds: form.tagIds,
  };
}

function Fields({
  form,
  setForm,
  allTags,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
  allTags: Tag[];
}) {
  function updateIngredient(index: number, patch: Partial<IngredientRow>) {
    const next = [...form.ingredients];
    next[index] = { ...next[index], ...patch };
    setForm({ ...form, ingredients: next });
  }
  function removeIngredient(index: number) {
    setForm({ ...form, ingredients: form.ingredients.filter((_, i) => i !== index) });
  }
  function addIngredient() {
    setForm({ ...form, ingredients: [...form.ingredients, { name: "", quantity: "" }] });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="r-title">Title</Label>
        <Input id="r-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="r-desc">Description (optional)</Label>
        <Textarea
          id="r-desc"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1.5">
          <Label htmlFor="r-prep">Prep (min)</Label>
          <Input
            id="r-prep"
            type="number"
            value={form.prepMinutes}
            onChange={(e) => setForm({ ...form, prepMinutes: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="r-cook">Cook (min)</Label>
          <Input
            id="r-cook"
            type="number"
            value={form.cookMinutes}
            onChange={(e) => setForm({ ...form, cookMinutes: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="r-servings">Servings</Label>
          <Input
            id="r-servings"
            type="number"
            value={form.servings}
            onChange={(e) => setForm({ ...form, servings: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Ingredients</Label>
        <div className="space-y-1.5">
          {form.ingredients.map((ing, i) => (
            <div key={i} className="flex gap-1.5">
              <Input
                placeholder="Ingredient"
                value={ing.name}
                onChange={(e) => updateIngredient(i, { name: e.target.value })}
                className="flex-1"
              />
              <Input
                placeholder="Qty"
                value={ing.quantity}
                onChange={(e) => updateIngredient(i, { quantity: e.target.value })}
                className="w-20"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive shrink-0"
                aria-label="Remove ingredient"
                onClick={() => removeIngredient(i)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="ghost" size="sm" className="gap-1" onClick={addIngredient}>
          <Plus className="size-3.5" /> Add ingredient
        </Button>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="r-instructions">Instructions</Label>
        <Textarea
          id="r-instructions"
          value={form.instructions}
          onChange={(e) => setForm({ ...form, instructions: e.target.value })}
          className="min-h-32"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="r-source">Source (optional)</Label>
        <Input id="r-source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="r-notes">Notes (optional)</Label>
        <Textarea id="r-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label>Tags</Label>
        <TagPicker
          allTags={allTags}
          selectedIds={form.tagIds}
          onChange={(tagIds) => setForm({ ...form, tagIds })}
        />
      </div>
    </div>
  );
}

export function AddRecipeButton({ allTags }: { allTags: Tag[] }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setForm(emptyForm());
      }}
    >
      <SheetTrigger render={<Button type="button" size="sm" className="gap-1" />}>
        <Plus className="size-3.5" /> Add recipe
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add recipe</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4">
          <Fields form={form} setForm={setForm} allTags={allTags} />
        </div>
        <SheetFooter>
          <Button
            type="button"
            disabled={!form.title.trim() || !form.instructions.trim() || pending}
            onClick={() => {
              startTransition(async () => {
                const id = await createRecipe(toInput(form));
                setOpen(false);
                router.push(`/groceries/recipes/${id}`);
              });
            }}
          >
            Add recipe
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function EditRecipeButton({ recipe, allTags }: { recipe: ExistingRecipe; allTags: Tag[] }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(() => recipeToForm(recipe));
  const [pending, startTransition] = useTransition();

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) setForm(recipeToForm(recipe));
      }}
    >
      <SheetTrigger render={<Button type="button" variant="outline" size="sm" className="gap-1" />}>
        <Pencil className="size-3.5" /> Edit
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit recipe</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4">
          <Fields form={form} setForm={setForm} allTags={allTags} />
        </div>
        <SheetFooter>
          <Button
            type="button"
            disabled={!form.title.trim() || !form.instructions.trim() || pending}
            onClick={() => {
              startTransition(async () => {
                await updateRecipe(recipe.id, toInput(form));
                setOpen(false);
              });
            }}
          >
            Save
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
