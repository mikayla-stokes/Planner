import { getWeekEntries, getRecipeOptions } from "./queries";
import { MealPlanView } from "./meal-plan-view";
import { addDaysUTC, parseDateParam, startOfWeekUTC, todayDateOnly } from "../date-utils";
import { ExportButton } from "@/components/export-button";
import { dateOnly, label } from "@/lib/export";

const SLOT_ORDER = { BREAKFAST: 0, LUNCH: 1, DINNER: 2 };

export default async function MealPlanPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  const currentWeekStart = startOfWeekUTC(todayDateOnly());
  const weekStart = parseDateParam(week) ?? currentWeekStart;
  const weekEnd = addDaysUTC(weekStart, 6);

  const [entries, recipeOptions] = await Promise.all([getWeekEntries(weekStart, weekEnd), getRecipeOptions()]);

  const exportSheets = [
    {
      name: "Meal Plan",
      rows: [...entries]
        .sort((a, b) => a.date.getTime() - b.date.getTime() || SLOT_ORDER[a.slot] - SLOT_ORDER[b.slot])
        .map((e) => ({
          Date: dateOnly(e.date),
          Day: e.date.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" }),
          Meal: label(e.slot),
          Dish: e.recipe?.title ?? e.mealName,
          Notes: e.notes,
        })),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Meal Plan</h1>
          <p className="text-muted-foreground text-sm">Plan breakfast, lunch, and dinner for the week.</p>
        </div>
        <ExportButton filename={`meal-plan-week-of-${dateOnly(weekStart)}`} sheets={exportSheets} />
      </div>
      <MealPlanView
        weekStart={weekStart}
        entries={entries}
        recipeOptions={recipeOptions}
        isCurrentWeek={weekStart.getTime() === currentWeekStart.getTime()}
      />
    </div>
  );
}
