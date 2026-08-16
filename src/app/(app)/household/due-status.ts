import type { RecurrenceFrequency } from "@/generated/prisma/enums";

const MAX_DAYS: Record<RecurrenceFrequency, number> = {
  DAILY: 1,
  WEEKLY: 7,
  MONTHLY: 30,
};

export function daysSince(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

export function isChoreDue(frequency: RecurrenceFrequency, lastCompletedAt: Date | null): boolean {
  if (!lastCompletedAt) return true;
  return daysSince(lastCompletedAt) >= MAX_DAYS[frequency];
}

export function choreStatusLabel(frequency: RecurrenceFrequency, lastCompletedAt: Date | null): string {
  if (!lastCompletedAt) return "Never done";
  const days = daysSince(lastCompletedAt);
  if (days === 0) return "Done today";
  const doneLabel = days === 1 ? "Done 1 day ago" : `Done ${days} days ago`;
  return isChoreDue(frequency, lastCompletedAt) ? `${doneLabel} — due now` : doneLabel;
}
