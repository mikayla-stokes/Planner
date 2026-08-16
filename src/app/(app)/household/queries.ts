import { db } from "@/lib/db";

export async function getChores() {
  return db.chore.findMany({
    include: { assignee: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function getHomeProjects() {
  return db.homeProject.findMany({
    orderBy: [{ completed: "asc" }, { dueDate: "asc" }, { createdAt: "asc" }],
  });
}

export async function getProfiles() {
  return db.profile.findMany({ orderBy: { name: "asc" } });
}
