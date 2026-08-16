"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { EditBillButton } from "./bill-dialog";
import { toggleBillPaid } from "./actions";
import { isBillPaidThisCycle } from "../bill-status";
import type { getBills, getProfiles } from "./queries";

// Prisma's Decimal `amount` field can't cross the Server -> Client Component
// boundary as-is, so the page serializes it to a string before this list
// component ever sees it.
type Bills = (Omit<Awaited<ReturnType<typeof getBills>>[number], "amount"> & { amount: string })[];
type Profiles = Awaited<ReturnType<typeof getProfiles>>;

const FREQUENCY_LABELS: Record<string, string> = { MONTHLY: "Monthly", QUARTERLY: "Quarterly", YEARLY: "Yearly" };

function money(value: unknown) {
  return Number(value ?? 0).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function BillRow({ bill, profiles }: { bill: Bills[number]; profiles: Profiles }) {
  const [lastPaidAt, setLastPaidAt] = useState(bill.lastPaidAt);
  const [pending, startTransition] = useTransition();
  const paid = isBillPaidThisCycle(bill.frequency, lastPaidAt);

  return (
    <div className={cn("flex items-start justify-between gap-3 py-2.5", pending && "opacity-60")}>
      <div className="flex items-start gap-2.5">
        <Checkbox
          className="mt-0.5"
          checked={paid}
          onCheckedChange={(v) => {
            const next = v === true;
            const previous = lastPaidAt;
            setLastPaidAt(next ? new Date() : null);
            startTransition(async () => {
              try {
                await toggleBillPaid(bill.id, next);
              } catch {
                setLastPaidAt(previous);
              }
            });
          }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={cn("text-sm font-medium", paid && "text-muted-foreground line-through")}>
              {bill.name}
            </span>
            <Badge variant={paid ? "outline" : "default"} className="text-[10px]">
              {paid ? "Paid" : "Unpaid"}
            </Badge>
            {bill.autopay && (
              <Badge variant="secondary" className="text-[10px]">
                Autopay
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {money(bill.amount)} · {FREQUENCY_LABELS[bill.frequency]}
            {bill.dueDay ? ` · Due day ${bill.dueDay}` : ""}
            {bill.assignee ? ` · ${bill.assignee.name}` : ""}
          </p>
        </div>
      </div>
      <EditBillButton
        bill={{
          id: bill.id,
          name: bill.name,
          amount: bill.amount,
          dueDay: bill.dueDay,
          frequency: bill.frequency,
          autopay: bill.autopay,
          assigneeId: bill.assigneeId,
          notes: bill.notes,
        }}
        profiles={profiles}
      />
    </div>
  );
}

export function BillsList({ bills, profiles }: { bills: Bills; profiles: Profiles }) {
  return (
    <Card>
      <CardContent className="divide-y py-0">
        {bills.map((bill) => (
          <BillRow key={bill.id} bill={bill} profiles={profiles} />
        ))}
        {bills.length === 0 && <p className="text-muted-foreground py-8 text-center text-sm">No bills yet.</p>}
      </CardContent>
    </Card>
  );
}
