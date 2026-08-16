import { db } from "@/lib/db";

export async function getLinkDocuments() {
  return db.linkDocument.findMany({ orderBy: [{ category: "asc" }, { title: "asc" }] });
}
