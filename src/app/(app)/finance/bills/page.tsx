import { getBills, getProfiles } from "./queries";
import { BillsList } from "./bills-list";
import { AddBillButton } from "./bill-dialog";
import { isBillPaidThisCycle } from "../bill-status";
import { ExportButton } from "@/components/export-button";
import { label, toNumber, yesNo } from "@/lib/export";

export default async function BillsPage() {
  const [bills, profiles] = await Promise.all([getBills(), getProfiles()]);
  // Prisma's Decimal fields can't cross the Server -> Client Component
  // boundary as-is, so serialize before handing the list to BillsList.
  const serializedBills = bills.map((b) => ({ ...b, amount: b.amount.toString() }));

  const exportSheets = [
    {
      name: "Bills",
      rows: bills.map((b) => ({
        Bill: b.name,
        Amount: toNumber(b.amount),
        Frequency: label(b.frequency),
        "Due Day": b.dueDay,
        Autopay: yesNo(b.autopay),
        "Paid This Cycle": yesNo(isBillPaidThisCycle(b.frequency, b.lastPaidAt)),
        "Last Paid": b.lastPaidAt,
        Assignee: b.assignee?.name,
        Notes: b.notes,
      })),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Bills</h1>
          <p className="text-muted-foreground text-sm">{bills.length} recurring bills</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ExportButton filename="bills" sheets={exportSheets} />
          <AddBillButton profiles={profiles} />
        </div>
      </div>
      <BillsList bills={serializedBills} profiles={profiles} />
    </div>
  );
}
