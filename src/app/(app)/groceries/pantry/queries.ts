import { db } from "@/lib/db";

export async function getPantryItems() {
  return db.pantryItem.findMany({ orderBy: { name: "asc" } });
}
