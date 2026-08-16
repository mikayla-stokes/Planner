import { getWeekEntries, getRecipeOptions } from "./queries";
import { MealPlanView } from "./meal-plan-view";
import { addDaysUTC, parseDateParam, startOfWeekUTC, todayDateOnly } from "../date-utils";

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

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Meal Plan</h1>
        <p className="text-muted-foreground text-sm">Plan breakfast, lunch, and dinner for the week.</p>
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
