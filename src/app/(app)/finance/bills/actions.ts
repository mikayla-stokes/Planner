"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import type { BillFrequency } from "@/generated/prisma/enums";

export type BillInput = {
  name: string;
  amount: number;
  dueDay?: number | null;
  frequency: BillFrequency;
  autopay: boolean;
  assigneeId?: string | null;
  notes?: string;
};

function cleanBill(input: BillInput) {
  return {
    name: input.name,
    amount: input.amount,
    dueDay: input.dueDay ?? null,
    frequency: input.frequency,
    autopay: input.autopay,
    assigneeId: input.assigneeId || null,
    notes: input.notes || null,
  };
}

export async function createBill(input: BillInput) {
  await db.bill.create({ data: cleanBill(input) });
  revalidatePath("/finance/bills");
}

export async function updateBill(id: string, input: BillInput) {
  await db.bill.update({ where: { id }, data: cleanBill(input) });
  revalidatePath("/finance/bills");
}

export async function deleteBill(id: string) {
  await db.bill.delete({ where: { id } });
  revalidatePath("/finance/bills");
}

export async function toggleBillPaid(id: string, paid: boolean) {
  await db.bill.update({ where: { id }, data: { lastPaidAt: paid ? new Date() : null } });
  revalidatePath("/finance/bills");
}
