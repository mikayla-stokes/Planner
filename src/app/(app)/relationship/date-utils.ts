// DailyCheckIn.date is a Postgres `date` column (no time-of-day, no timezone),
// so every Date we construct for it must represent the intended calendar day
// at UTC midnight — otherwise a local-timezone Date can serialize to the
// previous or next day once stored.

export function dateOnlyUTC(d: Date): Date {
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

export function todayDateOnly(): Date {
  return dateOnlyUTC(new Date());
}

export function formatCheckInDate(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });
}
