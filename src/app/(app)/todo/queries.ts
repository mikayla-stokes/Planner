import { db } from "@/lib/db";
import { isChoreDue } from "../household/due-status";

const PRIORITY_RANK = { HIGH: 0, MEDIUM: 1, LOW: 2 };

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

// ---------- Priority roll-up (Household / Work / Wedding Checklist) ----------
// Read-write glance widgets on the To-Do page — see household/queries.ts,
// work/queries.ts, and wedding/checklist/queries.ts for the "home" versions
// of these same items.

export async function getHouseholdPriorities() {
  const [projects, chores] = await Promise.all([
    db.homeProject.findMany({
      where: { completed: false, priority: { not: null } },
      orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }],
    }),
    db.chore.findMany({
      where: { priority: { not: null } },
      include: { assignee: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);
  const dueChores = chores.filter((c) => isChoreDue(c.frequency, c.lastCompletedAt));

  const items = [
    ...projects.map((project) => ({ kind: "project" as const, priority: project.priority!, project })),
    ...dueChores.map((chore) => ({ kind: "chore" as const, priority: chore.priority!, chore })),
  ];
  return items.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
}

export async function getWorkPriorities() {
  const tasks = await db.task.findMany({
    where: { listType: "WORK", completed: false, priority: { not: null } },
    include: { profile: true },
    orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }],
  });
  return tasks.sort((a, b) => PRIORITY_RANK[a.priority!] - PRIORITY_RANK[b.priority!]);
}

export async function getWeddingPriorities() {
  const items = await db.checklistItem.findMany({
    where: { completed: false, priority: { not: null }, parentItemId: null },
    orderBy: { createdAt: "asc" },
  });
  return items.sort((a, b) => PRIORITY_RANK[a.priority!] - PRIORITY_RANK[b.priority!]);
}

export async function getWeddingPriorityMilestoneId() {
  const milestone = await db.checklistMilestone.findFirst({ orderBy: { sortOrder: "asc" }, select: { id: true } });
  return milestone?.id ?? null;
}
