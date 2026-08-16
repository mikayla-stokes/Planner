import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AddBudgetItemButton, EditBudgetItemButton } from "./budget-item-dialog";

function money(value: unknown) {
  return Number(value ?? 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export default async function BudgetPage() {
  const [items, expenses] = await Promise.all([
    db.weddingBudgetItem.findMany({ orderBy: { category: "asc" } }),
    db.weddingExpense.findMany({ orderBy: { date: "desc" } }),
  ]);

  const totalBudget = items.reduce((sum, i) => sum + Number(i.budget ?? i.estimatedCost ?? 0), 0);
  const totalPaid = items.reduce((sum, i) => sum + Number(i.amountPaid ?? 0), 0);
  const totalReceived = expenses
    .filter((e) => e.type === "INCOME")
    .reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Budget</h1>
          <p className="text-muted-foreground text-sm">
            {money(totalPaid)} paid of {money(totalBudget)} budgeted
            {totalReceived > 0 ? ` · ${money(totalReceived)} received in gifts` : ""}
          </p>
        </div>
        <AddBudgetItemButton />
      </div>

      <div className="space-y-2">
        {items.map((item) => {
          const budget = Number(item.budget ?? item.estimatedCost ?? 0);
          const paid = Number(item.amountPaid ?? 0);
          const pct = budget === 0 ? 0 : Math.min(100, Math.round((paid / budget) * 100));

          return (
            <Card key={item.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">{item.item}</CardTitle>
                  <div className="flex shrink-0 items-center gap-1">
                    <span className="text-muted-foreground text-xs">{item.category}</span>
                    <EditBudgetItemButton
                      item={{
                        id: item.id,
                        item: item.item,
                        priorityLevel: item.priorityLevel,
                        category: item.category,
                        estimatedCost: item.estimatedCost?.toString() ?? null,
                        budget: item.budget?.toString() ?? null,
                        amountPaid: item.amountPaid.toString(),
                        notes: item.notes,
                      }}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-1.5">
                <Progress value={pct} className="h-1.5" />
                <div className="text-muted-foreground flex justify-between text-xs">
                  <span>
                    {money(paid)} paid of {money(budget)}
                  </span>
                  <span>{item.priorityLevel}</span>
                </div>
                {item.notes && <p className="text-xs italic">{item.notes}</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recent Spending</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {expenses.slice(0, 15).map((expense) => (
            <div key={expense.id} className="flex items-center justify-between text-sm">
              <div>
                <p>{expense.description || expense.subcategory || expense.category}</p>
                <p className="text-muted-foreground text-xs">
                  {expense.date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  · {expense.category}
                </p>
              </div>
              <span className={expense.type === "INCOME" ? "text-emerald-600" : undefined}>
                {expense.type === "INCOME" ? "+" : "-"}
                {money(expense.amount)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
