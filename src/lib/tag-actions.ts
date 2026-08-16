"use server";

import { db } from "@/lib/db";

const PALETTE = [
  "#e07a5f",
  "#81b29a",
  "#f2cc8f",
  "#3d5a80",
  "#9d8189",
  "#588157",
  "#bc6c25",
  "#6d597a",
];

function colorForName(name: string): string {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

export async function getAllTags() {
  return db.tag.findMany({ orderBy: { name: "asc" } });
}

export async function createTag(name: string) {
  return db.tag.upsert({
    where: { name },
    update: {},
    create: { name, color: colorForName(name) },
  });
}

/** Replaces every tag assignment for one entity — simplest correct approach at this scale. */
export async function setEntityTags(entityType: string, entityId: string, tagIds: string[]) {
  await db.entityTag.deleteMany({ where: { entityType, entityId } });
  if (tagIds.length > 0) {
    await db.entityTag.createMany({
      data: tagIds.map((tagId) => ({ entityType, entityId, tagId })),
    });
  }
}

export async function getEntityTags(entityType: string, entityIds: string[]) {
  if (entityIds.length === 0) return new Map<string, { id: string; name: string; color: string }[]>();
  const rows = await db.entityTag.findMany({
    where: { entityType, entityId: { in: entityIds } },
    include: { tag: true },
  });
  const map = new Map<string, { id: string; name: string; color: string }[]>();
  for (const row of rows) {
    if (!map.has(row.entityId)) map.set(row.entityId, []);
    map.get(row.entityId)!.push(row.tag);
  }
  return map;
}
