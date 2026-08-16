import { loadWorkbook, sheetToRows, optionalStr, str } from "./xlsx-utils";

export type SeedBudgetItem = {
  item: string;
  priorityLevel?: string;
  category: string;
  estimatedCost?: number;
  budget?: number;
  amountPaid: number;
  amountRemaining?: number;
  notes?: string;
};

export type SeedExpense = {
  date: Date;
  amount: number;
  category: string;
  subcategory?: string;
  purchasedFrom?: string;
  description?: string;
  type: "EXPENSE" | "INCOME";
};

function parseMoney(value: string | undefined): number | undefined {
  const v = str(value).replace(/[$,]/g, "");
  if (v.length === 0) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function parseDate(value: string | undefined): Date | undefined {
  const v = str(value);
  if (!v) return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export function buildBudgetItems(): SeedBudgetItem[] {
  const wb = loadWorkbook("Wedding Spreadsheets (Private).xlsx");
  const rows = sheetToRows(wb, "Budget").filter((r) => str(r["Item"]).length > 0);

  return rows.map((row) => ({
    item: str(row["Item"]),
    priorityLevel: optionalStr(row["Priority Level"]),
    category: str(row["Category"]) || "Other",
    estimatedCost: parseMoney(row["Estimated Cost"]),
    budget: parseMoney(row["Budget"]),
    amountPaid: parseMoney(row["Amount Paid"]) ?? 0,
    amountRemaining: parseMoney(row["Amount Remaining"]),
    notes: optionalStr(row["Notes"]),
  }));
}

// The Spending sheet has a transaction log AND an unrelated pivot/summary panel
// bolted onto the same rows via extra __EMPTY_N columns — we only read the named
// transaction columns, so the pivot decoration is naturally ignored. Rows with no
// parseable amount are future/planned payments already represented by the Budget
// sheet's paid-vs-budget tracking, so they're skipped here.
export function buildExpenses(): SeedExpense[] {
  const wb = loadWorkbook("Wedding Spreadsheets (Private).xlsx");
  const rows = sheetToRows(wb, "Spending");

  const expenses: SeedExpense[] = [];
  for (const row of rows) {
    const date = parseDate(row["Date"]);
    const amount = parseMoney(row["Amount"]);
    if (!date || amount === undefined) continue;

    const rawCategory = str(row["Category"]);
    const subcategory = optionalStr(row["Subcategory"]);
    const isIncome = rawCategory.toLowerCase() === "received";
    // Photo/Video spend was logged under Category "Misc" with Subcategory
    // "Photo and Video" in the source sheet — reclassify so budget reporting
    // groups it correctly.
    const category =
      subcategory?.toLowerCase() === "photo and video" ? "Photo/Video" : rawCategory || "Other";

    expenses.push({
      date,
      amount,
      category,
      subcategory,
      purchasedFrom: optionalStr(row["Purchased From"]),
      description: optionalStr(row["Description"]),
      type: isIncome ? "INCOME" : "EXPENSE",
    });
  }
  return expenses;
}
