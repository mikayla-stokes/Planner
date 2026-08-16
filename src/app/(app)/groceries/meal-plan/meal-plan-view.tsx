"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MealSlotCell } from "./meal-slot-dialog";
import { addMissingIngredientsForWeek } from "./actions";
import { addDaysUTC, formatDayLabel, formatWeekRange, toDateParam } from "../date-utils";
import type { MealSlot } from "@/generated/prisma/enums";
import type { getWeekEntries, getRecipeOptions } from "./queries";

type Entries = Awaited<ReturnType<typeof getWeekEntries>>;
type RecipeOptions = Awaited<ReturnType<typeof getRecipeOptions>>;

const SLOTS: MealSlot[] = ["BREAKFAST", "LUNCH", "DINNER"];

export function MealPlanView({
  weekStart,
  entries,
  recipeOptions,
  isCurrentWeek,
}: {
  weekStart: Date;
  entries: Entries;
  recipeOptions: RecipeOptions;
  isCurrentWeek: boolean;
}) {
  const weekEnd = addDaysUTC(weekStart, 6);
  const prevWeek = toDateParam(addDaysUTC(weekStart, -7));
  const nextWeek = toDateParam(addDaysUTC(weekStart, 7));

  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<number | null>(null);

  const days = Array.from({ length: 7 }, (_, i) => addDaysUTC(weekStart, i));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            nativeButton={false}
            render={<Link href={`/groceries/meal-plan?week=${prevWeek}`} />}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm font-medium">{formatWeekRange(weekStart, weekEnd)}</span>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            nativeButton={false}
            render={<Link href={`/groceries/meal-plan?week=${nextWeek}`} />}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
        {!isCurrentWeek && (
          <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/groceries/meal-plan" />}>
            This week
          </Button>
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5"
        disabled={pending}
        onClick={() => {
          setResult(null);
          startTransition(async () => {
            const { added } = await addMissingIngredientsForWeek(weekStart, weekEnd);
            setResult(added);
          });
        }}
      >
        <ShoppingCart className="size-3.5" />
        {result !== null ? `Added ${result} item${result === 1 ? "" : "s"}` : "Add missing ingredients"}
      </Button>

      <div className="space-y-2">
        {days.map((day) => {
          const dayParam = toDateParam(day);
          return (
            <Card key={dayParam}>
              <CardContent className="space-y-0.5 py-2">
                <p className="px-2 pb-1 text-sm font-semibold">{formatDayLabel(day)}</p>
                {SLOTS.map((slot) => {
                  const entry = entries.find((e) => toDateParam(e.date) === dayParam && e.slot === slot);
                  return <MealSlotCell key={slot} date={day} slot={slot} entry={entry} recipeOptions={recipeOptions} />;
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
