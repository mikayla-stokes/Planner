import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getCategories, getExpensesThisMonth } from "./queries";
import { AddCategoryButton, EditCategoryButton } from "./category-dialog";

function money(value: unknown) {
  return Number(value ?? 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export default async function FinancePage() {
  const [categories, expenses] = await Promise.all([getCategories(), getExpensesThisMonth()]);

  const spentByCategory = new Map<string, number>();
  for (const e of expenses) {
    if (!e.categoryId) continue;
    spentByCategory.set(e.categoryId, (spentByCategory.get(e.categoryId) ?? 0) + Number(e.amount));
  }

  const totalBudget = categories.reduce((sum, c) => sum + Number(c.monthlyBudget), 0);
  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Budget</h1>
          <p className="text-muted-foreground text-sm">
            {money(totalSpent)} spent of {money(totalBudget)} budgeted this month
          </p>
        </div>
        <AddCategoryButton />
      </div>

      <div className="space-y-2">
        {categories.map((category) => {
          const budget = Number(category.monthlyBudget);
          const spent = spentByCategory.get(category.id) ?? 0;
          const pct = budget === 0 ? 0 : Math.min(100, Math.round((spent / budget) * 100));

          return (
            <Card key={category.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">{category.name}</CardTitle>
                  <EditCategoryButton
                    category={{
                      id: category.id,
                      name: category.name,
                      monthlyBudget: category.monthlyBudget.toString(),
                      notes: category.notes,
                    }}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-1.5">
                <Progress value={pct} className="h-1.5" />
                <div className="text-muted-foreground flex justify-between text-xs">
                  <span>
                    {money(spent)} spent of {money(budget)}
                  </span>
                  <span>{pct}%</span>
                </div>
                {category.notes && <p className="text-xs italic">{category.notes}</p>}
              </CardContent>
            </Card>
          );
        })}
        {categories.length === 0 && (
          <p className="text-muted-foreground py-8 text-center text-sm">No budget categories yet.</p>
        )}
      </div>
    </div>
  );
}
