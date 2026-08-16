// CalendarEvent.date is a Postgres `date` column (no time-of-day, no
// timezone), so every Date we construct for it must represent the intended
// calendar day at UTC midnight — otherwise a local-timezone Date can
// serialize to the previous or next day once stored.

export function dateOnlyUTC(d: Date): Date {
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

export function todayDateOnly(): Date {
  return dateOnlyUTC(new Date());
}

export function toDateParam(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function parseDateParam(s: string | undefined): Date | null {
  if (!s) return null;
  const parsed = new Date(`${s}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatEventDate(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", timeZone: "UTC" });
}
