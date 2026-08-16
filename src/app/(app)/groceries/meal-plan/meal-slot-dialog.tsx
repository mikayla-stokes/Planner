"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { setMealSlot, clearMealSlot } from "./actions";
import type { MealSlot } from "@/generated/prisma/enums";
import type { getWeekEntries, getRecipeOptions } from "./queries";

type Entry = Awaited<ReturnType<typeof getWeekEntries>>[number];
type RecipeOptions = Awaited<ReturnType<typeof getRecipeOptions>>;

const NONE = "NONE";
const SLOT_LABELS: Record<MealSlot, string> = { BREAKFAST: "Breakfast", LUNCH: "Lunch", DINNER: "Dinner" };

type FormState = { recipeId: string; mealName: string; notes: string };

function entryToForm(entry: Entry | undefined): FormState {
  return {
    recipeId: entry?.recipeId ?? NONE,
    mealName: entry?.mealName ?? "",
    notes: entry?.notes ?? "",
  };
}

export function MealSlotCell({
  date,
  slot,
  entry,
  recipeOptions,
}: {
  date: Date;
  slot: MealSlot;
  entry: Entry | undefined;
  recipeOptions: RecipeOptions;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(() => entryToForm(entry));
  const [pending, startTransition] = useTransition();

  const display = entry?.recipe?.title ?? entry?.mealName ?? null;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) setForm(entryToForm(entry));
      }}
    >
      <DialogTrigger
        render={
          <button
            type="button"
            className="hover:bg-accent flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm"
          />
        }
      >
        <span className="text-muted-foreground w-16 shrink-0 text-xs">{SLOT_LABELS[slot]}</span>
        <span className={display ? "flex-1" : "text-muted-foreground flex-1"}>{display ?? "+ Add"}</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{SLOT_LABELS[slot]}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Recipe</Label>
            <Select
              value={form.recipeId}
              onValueChange={(v) => setForm({ ...form, recipeId: v ?? NONE })}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(v: string) => (v === NONE ? "None — type a meal below" : (recipeOptions.find((r) => r.id === v)?.title ?? v))}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>None — type a meal below</SelectItem>
                {recipeOptions.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {form.recipeId === NONE && (
            <div className="space-y-1.5">
              <Label htmlFor="meal-name">Meal</Label>
              <Input
                id="meal-name"
                value={form.mealName}
                onChange={(e) => setForm({ ...form, mealName: e.target.value })}
                placeholder="e.g. Leftovers, cereal, eating out…"
                autoFocus
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="meal-notes">Notes (optional)</Label>
            <Textarea id="meal-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>
        <DialogFooter className="flex-row justify-between sm:justify-between">
          {entry && (
            <ConfirmDeleteButton
              itemLabel={`${SLOT_LABELS[slot]} entry`}
              size="sm"
              onConfirm={async () => {
                await clearMealSlot(date, slot);
                setOpen(false);
              }}
            />
          )}
          <Button
            type="button"
            className={entry ? "" : "ml-auto"}
            disabled={pending || (form.recipeId === NONE && !form.mealName.trim())}
            onClick={() => {
              startTransition(async () => {
                await setMealSlot(date, slot, {
                  recipeId: form.recipeId === NONE ? null : form.recipeId,
                  mealName: form.mealName,
                  notes: form.notes,
                });
                setOpen(false);
              });
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
