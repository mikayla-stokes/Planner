import { readFileSync } from "fs";
import path from "path";

export type ChecklistOwner = "MIKAYLA" | "CALEB" | "SHARED" | "UNDECIDED";

export type SeedChecklistItem = {
  title: string;
  notes?: string;
  owner: ChecklistOwner;
  subItems: { title: string; notes?: string; owner: ChecklistOwner }[];
};

export type SeedMilestone = {
  label: string;
  monthsOut?: number;
  fixedDate?: Date;
  items: SeedChecklistItem[];
};

function parseBulletLine(line: string): { title: string; notes?: string } {
  const trimmed = line.replace(/^-\s*/, "").trim();
  // Editorial asides like "*(likely belongs with 11 Months Out)*" move into notes.
  const match = trimmed.match(/^(.*?)\s*\*\(([^)]+)\)\*\s*$/);
  if (match) return { title: match[1].trim(), notes: match[2].trim() };
  return { title: trimmed };
}

function monthsOutFromLabel(label: string): number | undefined {
  const match = label.match(/^(\d+)\s+Months?\s+Out/i);
  return match ? Number(match[1]) : undefined;
}

function fixedDateFromLabel(label: string): Date | undefined {
  // e.g. "Wedding Day (May 1)", "2 Weeks Out (April 17)", "1 Week Out (April 24)"
  const match = label.match(/\(([A-Za-z]+ \d{1,2})\)/);
  if (!match) return undefined;
  const date = new Date(`${match[1]}, 2027`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function parseChecklistMarkdown(
  filename: string,
  defaultOwner: ChecklistOwner,
  ownerOverrides: Record<string, ChecklistOwner> = {},
): SeedMilestone[] {
  const filePath = path.join(__dirname, "..", "..", "seed-data", filename);
  const lines = readFileSync(filePath, "utf-8").split("\n");

  const milestones: SeedMilestone[] = [];
  let current: SeedMilestone | null = null;
  let currentOwner: ChecklistOwner = defaultOwner;
  let lastItem: SeedChecklistItem | null = null;

  for (const rawLine of lines) {
    const line = rawLine.replace(/\r$/, "");

    if (line.startsWith("## ")) {
      const label = line.slice(3).trim();
      current = {
        label,
        monthsOut: monthsOutFromLabel(label),
        fixedDate: fixedDateFromLabel(label),
        items: [],
      };
      milestones.push(current);
      currentOwner = ownerOverrides[label] ?? defaultOwner;
      lastItem = null;
      continue;
    }

    if (!current) continue; // title/intro prose before the first heading

    if (/^ {2}- /.test(line)) {
      if (lastItem) {
        const { title, notes } = parseBulletLine(line.trim());
        lastItem.subItems.push({ title, notes, owner: currentOwner });
      }
      continue;
    }

    if (/^- /.test(line)) {
      const { title, notes } = parseBulletLine(line);
      const item: SeedChecklistItem = { title, notes, owner: currentOwner, subItems: [] };
      current.items.push(item);
      lastItem = item;
      continue;
    }
    // blank lines, prose, and "---" separators are ignored
  }

  return milestones;
}
