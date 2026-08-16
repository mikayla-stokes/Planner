import { readFileSync } from "fs";
import path from "path";
import * as XLSX from "xlsx";

const SEED_DATA_DIR = path.join(__dirname, "..", "..", "seed-data");

export function loadWorkbook(filename: string): XLSX.WorkBook {
  const buf = readFileSync(path.join(SEED_DATA_DIR, filename));
  return XLSX.read(buf, { cellDates: true });
}

export function sheetToRows(
  workbook: XLSX.WorkBook,
  sheetName: string,
): Record<string, string>[] {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) throw new Error(`Sheet "${sheetName}" not found`);
  return XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
    defval: "",
    raw: false,
  });
}

export function truthy(value: string | undefined): boolean {
  return (value ?? "").trim().toUpperCase() === "TRUE";
}

export function str(value: string | undefined): string {
  return (value ?? "").trim();
}

export function optionalStr(value: string | undefined): string | undefined {
  const v = str(value);
  return v.length > 0 ? v : undefined;
}

export function splitList(value: string | undefined): string[] {
  return str(value)
    .split(",")
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
}
