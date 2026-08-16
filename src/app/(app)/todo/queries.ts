import { db } from "@/lib/db";

export async function getTasks() {
  return db.task.findMany({
    where: { listType: "GENERAL" },
    include: { profile: true },
    orderBy: [{ completed: "asc" }, { dueDate: "asc" }, { createdAt: "asc" }],
  });
}

export async function getProfiles() {
  return db.profile.findMany({ orderBy: { name: "asc" } });
}
