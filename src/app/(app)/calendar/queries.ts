import { db } from "@/lib/db";

export async function getEvents() {
  return db.calendarEvent.findMany({ orderBy: [{ date: "asc" }, { createdAt: "asc" }] });
}
