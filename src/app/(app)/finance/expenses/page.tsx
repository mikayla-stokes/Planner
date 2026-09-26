import { getExpenses, getCategories, getProfiles } from "./queries";
import { ExpenseList } from "./expense-list";
import { AddExpenseButton } from "./expense-dialog";
import { ExportButton } from "@/components/export-button";
import { dateOnly, toNumber } from "@/lib/export";

export default async function ExpensesPage() {
  const [expenses, categories, profiles] = await Promise.all([getExpenses(), getCategories(), getProfiles()]);
  // Prisma's Decimal fields can't cross the Server -> Client Component
  // boundary as-is, so serialize before handing the list to ExpenseList.
  const serializedExpenses = expenses.map((e) => ({ ...e, amount: e.amount.toString() }));

  const exportSheets = [
    {
      name: "Expenses",
      rows: expenses.map((e) => ({
        Date: dateOnly(e.date),
        Amount: toNumber(e.amount),
        Category: e.category?.name,
        Description: e.description,
        "Paid By": e.paidBy?.name,
      })),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground text-sm">{expenses.length} logged</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ExportButton filename="expenses" sheets={exportSheets} />
          <AddExpenseButton categories={categories} profiles={profiles} />
        </div>
      </div>
      <ExpenseList expenses={serializedExpenses} />
    </div>
  );
}
