import { getBills, getProfiles } from "./queries";
import { BillsList } from "./bills-list";
import { AddBillButton } from "./bill-dialog";

export default async function BillsPage() {
  const [bills, profiles] = await Promise.all([getBills(), getProfiles()]);
  // Prisma's Decimal fields can't cross the Server -> Client Component
  // boundary as-is, so serialize before handing the list to BillsList.
  const serializedBills = bills.map((b) => ({ ...b, amount: b.amount.toString() }));

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Bills</h1>
          <p className="text-muted-foreground text-sm">{bills.length} recurring bills</p>
        </div>
        <AddBillButton profiles={profiles} />
      </div>
      <BillsList bills={serializedBills} profiles={profiles} />
    </div>
  );
}
