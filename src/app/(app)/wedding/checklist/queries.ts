import { db } from "@/lib/db";

export async function getMilestonesWithItems() {
  return db.checklistMilestone.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      items: {
        where: { parentItemId: null },
        orderBy: { createdAt: "asc" },
        include: {
          subItems: { orderBy: { createdAt: "asc" } },
        },
      },
    },
  });
}
