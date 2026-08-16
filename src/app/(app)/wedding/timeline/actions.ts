"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import type { TimelineSubEvent } from "@/generated/prisma/enums";

export type TimelineEventInput = {
  subEvent: TimelineSubEvent;
  time: string;
  description: string;
  location?: string;
};

export async function createTimelineEvent(input: TimelineEventInput) {
  const maxSort = await db.timelineEvent.aggregate({
    where: { subEvent: input.subEvent },
    _max: { sortOrder: true },
  });
  await db.timelineEvent.create({
    data: {
      subEvent: input.subEvent,
      time: input.time,
      description: input.description,
      location: input.location || null,
      sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
    },
  });
  revalidatePath("/wedding/timeline");
}

export async function updateTimelineEvent(id: string, input: TimelineEventInput) {
  await db.timelineEvent.update({
    where: { id },
    data: {
      subEvent: input.subEvent,
      time: input.time,
      description: input.description,
      location: input.location || null,
    },
  });
  revalidatePath("/wedding/timeline");
}

export async function deleteTimelineEvent(id: string) {
  await db.timelineEvent.delete({ where: { id } });
  revalidatePath("/wedding/timeline");
}
