"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { deleteExpense } from "./actions";
import type { getExpenses } from "./queries";

// Prisma's Decimal `amount` field can't cross the Server -> Client Component
// boundary as-is, so the page serializes it to a string before this list
// component ever sees it.
type Expenses = (Omit<Awaited<ReturnType<typeof getExpenses>>[number], "amount"> & { amount: string })[];

function money(value: unknown) {
  return Number(value ?? 0).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

export function ExpenseList({ expenses }: { expenses: Expenses }) {
  const [, startTransition] = useTransition();

  return (
    <Card>
      <CardContent className="divide-y py-0">
        {expenses.map((expense) => (
          <div key={expense.id} className="flex items-center gap-2.5 py-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm">{expense.description || expense.category?.name || "Expense"}</p>
              <p className="text-muted-foreground text-xs">
                {expense.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}
                {expense.category ? ` · ${expense.category.name}` : ""}
                {expense.paidBy ? ` · ${expense.paidBy.name}` : ""}
              </p>
            </div>
            <span className="text-sm font-medium">{money(expense.amount)}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive size-7"
              aria-label={`Remove ${expense.description || "expense"}`}
              onClick={() => startTransition(async () => await deleteExpense(expense.id))}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ))}
        {expenses.length === 0 && (
          <p className="text-muted-foreground py-8 text-center text-sm">No expenses logged yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
