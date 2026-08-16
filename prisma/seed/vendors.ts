import { loadWorkbook, sheetToRows, truthy, optionalStr, splitList, str } from "./xlsx-utils";

export type SeedVendor = {
  name: string;
  vendorType: string;
  officialChoice: boolean;
  favorite: boolean;
  website?: string;
  events: string[];
  pricing?: string;
  address?: string;
  email?: string;
  phone?: string;
  contacted: boolean;
  appointmentScheduled: boolean;
  packageDetails?: string;
  notes?: string;
};

export function buildVendors(): SeedVendor[] {
  const wb = loadWorkbook("Wedding Spreadsheets.xlsx");
  const rows = sheetToRows(wb, "Vendors").filter((r) => str(r["Name"]).length > 0);

  return rows.map((row) => ({
    name: str(row["Name"]),
    vendorType: str(row["Vendor Type"]) || "Other",
    officialChoice: truthy(row["Official Choice?"]),
    favorite: truthy(row["Favorite?"]),
    website: optionalStr(row["Website"]),
    events: splitList(row["Event"]),
    pricing: optionalStr(row["Pricing"]),
    address: optionalStr(row["Address"]),
    email: optionalStr(row["Email"]),
    phone: optionalStr(row["Phone Number"]),
    contacted: truthy(row["Contacted?"]),
    appointmentScheduled: truthy(row["Appointment Scheduled?"]),
    packageDetails: optionalStr(row["Package Details"]),
    notes: optionalStr(row["Notes"]),
  }));
}
