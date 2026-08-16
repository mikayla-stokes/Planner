import { db } from "@/lib/db";

export async function getGroceryItems() {
  return db.groceryListItem.findMany({
    orderBy: [{ checked: "asc" }, { createdAt: "asc" }],
  });
}
