// Shared shapes + formatters for the per-page "Export" button. Pages build
// their sheets on the server (where the data already is) and hand them to
// <ExportButton>, which turns them into an .xlsx download in the browser.

export type ExportCell = string | number | boolean | Date | null | undefined;
export type ExportRow = Record<string, ExportCell>;
export type ExportSheet = { name: string; rows: ExportRow[] };

/**
 * Date-only values (due dates, @db.Date columns) are stored as UTC midnight,
 * so format them in UTC — otherwise they'd shift back a day in US timezones.
 * Real timestamps (createdAt, lastPaidAt, ...) should be passed through as
 * Date objects instead; the button formats those in the viewer's local time.
 */
export function dateOnly(d: Date | null | undefined): string | null {
  return d ? d.toISOString().slice(0, 10) : null;
}

/** Prisma Decimals -> plain numbers so they're real numbers in Excel. */
export function toNumber(value: { toString(): string } | null | undefined): number | null {
  return value == null ? null : Number(value.toString());
}

/** "CALEB_ONLY" -> "Caleb only". */
export function label(value: string | null | undefined): string | null {
  if (!value) return null;
  const s = value.replace(/_/g, " ").toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function yesNo(value: boolean): string {
  return value ? "Yes" : "No";
}

/** Two-column Field/Value sheet for single-record pages (a recipe, a trip, the wedding). */
export function detailRows(fields: Record<string, ExportCell>): ExportRow[] {
  return Object.entries(fields).map(([Field, Value]) => ({ Field, Value }));
}
