import type { BillFrequency } from "@/generated/prisma/enums";

// Bills reset on calendar boundaries, not rolling day-counts (unlike Chores) —
// a bill paid on the 5th shouldn't read as "due again" 30 days later mid-month,
// it should stay paid until the next calendar month/quarter/year begins.
export function currentPeriodKey(frequency: BillFrequency, d: Date = new Date()): string {
  const year = d.getFullYear();
  if (frequency === "YEARLY") return `${year}`;
  if (frequency === "QUARTERLY") return `${year}-Q${Math.floor(d.getMonth() / 3) + 1}`;
  return `${year}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function isBillPaidThisCycle(frequency: BillFrequency, lastPaidAt: Date | null): boolean {
  if (!lastPaidAt) return false;
  return currentPeriodKey(frequency, lastPaidAt) === currentPeriodKey(frequency);
}
