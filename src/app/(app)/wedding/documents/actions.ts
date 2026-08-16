"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export type LinkDocumentInput = {
  title: string;
  url?: string;
  category: string;
  notes?: string;
};

function clean(input: LinkDocumentInput) {
  return {
    title: input.title,
    url: input.url || null,
    category: input.category.trim() || "Uncategorized",
    notes: input.notes || null,
  };
}

export async function createLinkDocument(input: LinkDocumentInput) {
  await db.linkDocument.create({ data: clean(input) });
  revalidatePath("/wedding/documents");
}

export async function updateLinkDocument(id: string, input: LinkDocumentInput) {
  await db.linkDocument.update({ where: { id }, data: clean(input) });
  revalidatePath("/wedding/documents");
}

export async function deleteLinkDocument(id: string) {
  await db.linkDocument.delete({ where: { id } });
  revalidatePath("/wedding/documents");
}
