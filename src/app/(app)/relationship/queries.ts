import { db } from "@/lib/db";
import { todayDateOnly } from "./date-utils";

export async function getProfiles() {
  return db.profile.findMany({ orderBy: { name: "asc" } });
}

export async function getTodayCheckIns() {
  return db.dailyCheckIn.findMany({
    where: { date: todayDateOnly() },
    include: { profile: true },
  });
}

export async function getHistory(limit = 60) {
  const today = todayDateOnly();
  return db.dailyCheckIn.findMany({
    where: { date: { lt: today } },
    include: { profile: true },
    orderBy: { date: "desc" },
    take: limit,
  });
}

export async function getGoals() {
  return db.goal.findMany({
    include: { profile: true },
    orderBy: [{ year: "desc" }, { quarter: "asc" }, { createdAt: "asc" }],
  });
}
