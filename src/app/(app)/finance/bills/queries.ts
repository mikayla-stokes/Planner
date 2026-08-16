import { db } from "@/lib/db";

export async function getBills() {
  return db.bill.findMany({ include: { assignee: true }, orderBy: { name: "asc" } });
}

export async function getProfiles() {
  return db.profile.findMany({ orderBy: { name: "asc" } });
}
