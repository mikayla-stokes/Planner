"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ExportCell, ExportSheet } from "@/lib/export";

// Excel sheet names: max 31 chars, none of : \ / ? * [ ], unique per workbook.
function sheetName(name: string, used: Set<string>) {
  const base = name.replace(/[:\\/?*[\]]/g, " ").trim().slice(0, 31) || "Sheet";
  let candidate = base;
  for (let i = 2; used.has(candidate.toLowerCase()); i++) {
    const suffix = ` (${i})`;
    candidate = base.slice(0, 31 - suffix.length) + suffix;
  }
  used.add(candidate.toLowerCase());
  return candidate;
}

function cellValue(value: ExportCell) {
  if (value instanceof Date) {
    return value.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
  }
  return value ?? "";
}

export function ExportButton({ filename, sheets }: { filename: string; sheets: ExportSheet[] }) {
  const [pending, setPending] = useState(false);

  async function handleExport() {
    setPending(true);
    try {
      // Loaded on click so the spreadsheet library isn't in every page's bundle.
      const XLSX = await import("xlsx");
      const workbook = XLSX.utils.book_new();
      const used = new Set<string>();

      for (const sheet of sheets) {
        const rows = sheet.rows.map((row) =>
          Object.fromEntries(Object.entries(row).map(([key, value]) => [key, cellValue(value)])),
        );
        const worksheet =
          rows.length > 0 ? XLSX.utils.json_to_sheet(rows) : XLSX.utils.aoa_to_sheet([["Nothing here yet."]]);

        if (rows.length > 0) {
          const headers = Object.keys(rows[0]);
          worksheet["!cols"] = headers.map((header) => ({
            wch: Math.min(60, Math.max(header.length, ...rows.map((r) => String(r[header] ?? "").length)) + 2),
          }));
        }
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName(sheet.name, used));
      }

      const today = new Date().toLocaleDateString("en-CA"); // yyyy-mm-dd, local
      XLSX.writeFile(workbook, `${filename}-${today}.xlsx`);
    } finally {
      setPending(false);
    }
  }

  return (
    <Button type="button" size="sm" variant="outline" className="gap-1" disabled={pending} onClick={handleExport}>
      <Download className="size-3.5" /> {pending ? "Exporting…" : "Export"}
    </Button>
  );
}
