"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import type { ChecklistOwner, Priority } from "@/generated/prisma/enums";

export async function toggleChecklistItem(id: string, completed: boolean) {
  await db.checklistItem.update({ where: { id }, data: { completed } });
  revalidatePath("/wedding/checklist");
  revalidatePath("/wedding");
}

export async function createChecklistItem(input: {
  milestoneId: string;
  parentItemId?: string;
  title: string;
  owner: ChecklistOwner;
  priority?: Priority | null;
  notes?: string;
}) {
  await db.checklistItem.create({
    data: {
      milestoneId: input.milestoneId,
      parentItemId: input.parentItemId,
      title: input.title,
      owner: input.owner,
      priority: input.priority || null,
      notes: input.notes || undefined,
    },
  });
  revalidatePath("/wedding/checklist");
  revalidatePath("/wedding");
}

export async function updateChecklistItem(input: {
  id: string;
  title: string;
  owner: ChecklistOwner;
  priority?: Priority | null;
  notes?: string;
}) {
  await db.checklistItem.update({
    where: { id: input.id },
    data: { title: input.title, owner: input.owner, priority: input.priority || null, notes: input.notes || null },
  });
  revalidatePath("/wedding/checklist");
  revalidatePath("/wedding");
}

export async function deleteChecklistItem(id: string) {
  await db.checklistItem.delete({ where: { id } });
  revalidatePath("/wedding/checklist");
  revalidatePath("/wedding");
}
