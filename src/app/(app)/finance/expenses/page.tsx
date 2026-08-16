import { getExpenses, getCategories, getProfiles } from "./queries";
import { ExpenseList } from "./expense-list";
import { AddExpenseButton } from "./expense-dialog";

export default async function ExpensesPage() {
  const [expenses, categories, profiles] = await Promise.all([getExpenses(), getCategories(), getProfiles()]);
  // Prisma's Decimal fields can't cross the Server -> Client Component
  // boundary as-is, so serialize before handing the list to ExpenseList.
  const serializedExpenses = expenses.map((e) => ({ ...e, amount: e.amount.toString() }));

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground text-sm">{expenses.length} logged</p>
        </div>
        <AddExpenseButton categories={categories} profiles={profiles} />
      </div>
      <ExpenseList expenses={serializedExpenses} />
    </div>
  );
}
