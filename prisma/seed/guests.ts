import { loadWorkbook, sheetToRows, truthy, optionalStr, splitList, str } from "./xlsx-utils";

export type SeedGuest = {
  firstName: string;
  lastName: string;
  tableName?: string;
  host: "BRIDE" | "GROOM" | "BOTH";
  type: "FAMILY" | "FRIENDS" | "PLUS_ONE" | "COLLEAGUES";
  role?: string;
  events: string[];
  saveTheDateSent: boolean;
  inviteSent: boolean;
  isKid: boolean;
  expectedRsvp?: "YES" | "NO" | "UNSURE";
  rsvpStatus: "YES" | "NO" | "PENDING";
  phone?: string;
  email?: string;
  addressedTo?: string;
  address?: string;
  cityZip?: string;
  arrivalDate?: string;
  dietaryPreferences?: string;
  notes?: string;
  needsReview: boolean;
  reviewNote?: string;
};

const HOST_MAP: Record<string, SeedGuest["host"]> = {
  bride: "BRIDE",
  groom: "GROOM",
  both: "BOTH",
};

const TYPE_MAP: Record<string, SeedGuest["type"]> = {
  family: "FAMILY",
  friends: "FRIENDS",
  "plus 1": "PLUS_ONE",
  colleagues: "COLLEAGUES",
};

// Fields compared between the public and private Guest List sheets to decide
// whether a row needs a "review this" flag — deliberately narrow. Other fields
// (Events naming, Host/Type categorization, Address/Addressed To) also differ
// between the two files, but those are either resolved naming differences
// (public's IL/FL shower split, already adopted) or private-file formula
// corruption (addresses replaced with row-index numbers), not real ambiguity —
// flagging them would bury the genuine conflicts below in noise. See the plan
// doc's guest-list reconciliation section.
const COMPARE_FIELDS = [
  "Table Number",
  "Save the Date Sent?",
  "Invite Sent?",
  "Expected to RSVP Yes",
  "Expected to RSVP No",
  "Not Sure What to Expect for the RSVP",
];

function isRealRow(row: Record<string, string>): boolean {
  // "Guest" with a blank last name is a legitimate unnamed plus-one (e.g.
  // "Gabriella Land & Guest" in Addressed To), not a template row — keep it.
  const first = str(row["First Name"]);
  const last = str(row["Last Name"]);
  if (first.length === 0 && last.length === 0) return false;
  // The sheet's final row is a totals/summary row (e.g. First Name "158" —
  // the total guest count) that happens to land in the name column. Every
  // real guest has both Host and Type filled in; a summary row doesn't.
  if (str(row["Host"]).length === 0 && str(row["Type"]).length === 0) return false;
  return true;
}

function nameKey(row: Record<string, string>): string {
  return `${str(row["First Name"]).toLowerCase()}|${str(row["Last Name"]).toLowerCase()}`;
}

function rsvpStatus(raw: string): SeedGuest["rsvpStatus"] {
  const v = raw.trim().toLowerCase();
  if (v.includes("yes")) return "YES";
  if (v.includes("no")) return "NO";
  return "PENDING";
}

function expectedRsvp(row: Record<string, string>): SeedGuest["expectedRsvp"] {
  if (truthy(row["Expected to RSVP Yes"])) return "YES";
  if (truthy(row["Expected to RSVP No"])) return "NO";
  if (truthy(row["Not Sure What to Expect for the RSVP"])) return "UNSURE";
  return undefined;
}

export function buildGuests(): { guests: SeedGuest[]; tableNames: string[] } {
  const publicWb = loadWorkbook("Wedding Spreadsheets.xlsx");
  const privateWb = loadWorkbook("Wedding Spreadsheets (Private).xlsx");

  const publicRows = sheetToRows(publicWb, "Guest List").filter(isRealRow);
  const privateRows = sheetToRows(privateWb, "Guest List").filter(isRealRow);

  const privateByKey = new Map<string, Record<string, string>>();
  for (const row of privateRows) {
    privateByKey.set(nameKey(row), row);
  }

  const guests: SeedGuest[] = [];
  const tableNames = new Set<string>();

  for (const row of publicRows) {
    const privateRow = privateByKey.get(nameKey(row));
    const conflicts: string[] = [];

    if (privateRow) {
      for (const field of COMPARE_FIELDS) {
        const pubVal = str(row[field]);
        const privVal = str(privateRow[field]);
        // Only a real conflict if BOTH sides have a value and they differ —
        // private simply being blank isn't a conflict, just missing data.
        if (pubVal !== privVal && privVal.length > 0) {
          conflicts.push(`${field}: was "${privVal}"`);
        }
      }
    }

    const tableName = optionalStr(row["Table Number"]);
    if (tableName) tableNames.add(tableName);

    guests.push({
      firstName: str(row["First Name"]),
      lastName: str(row["Last Name"]),
      tableName,
      host: HOST_MAP[str(row["Host"]).toLowerCase()] ?? "BOTH",
      type: TYPE_MAP[str(row["Type"]).toLowerCase()] ?? "FRIENDS",
      role: optionalStr(row["Role"]),
      events: splitList(row["Events"]),
      saveTheDateSent: truthy(row["Save the Date Sent?"]),
      inviteSent: truthy(row["Invite Sent?"]),
      isKid: truthy(row["Kid?"]),
      expectedRsvp: expectedRsvp(row),
      rsvpStatus: rsvpStatus(str(row["RSVP?"])),
      phone: optionalStr(row["Phone Number"]),
      email: optionalStr(row["Email"]),
      addressedTo: optionalStr(row["Addressed To"]),
      address: optionalStr(row["Address"]),
      cityZip: optionalStr(row["City/Zip"]),
      arrivalDate: optionalStr(row["Arrival Date (If coming from out of town)"]),
      dietaryPreferences: optionalStr(row["Dietary Preferences"]),
      notes: optionalStr(row["Notes"]),
      needsReview: conflicts.length > 0,
      reviewNote: conflicts.length > 0 ? conflicts.join("; ") : undefined,
    });
  }

  return { guests, tableNames: [...tableNames] };
}
