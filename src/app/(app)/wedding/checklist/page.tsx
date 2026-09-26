import { ChecklistBoard } from "./checklist-board";
import { getMilestonesWithItems } from "./queries";
import { ExportButton } from "@/components/export-button";
import { label, yesNo } from "@/lib/export";

export default async function ChecklistPage() {
  const milestones = await getMilestonesWithItems();

  const exportSheets = [
    {
      name: "Checklist",
      rows: milestones.flatMap((m) =>
        m.items.flatMap((item) =>
          [item, ...item.subItems].map((i) => ({
            Milestone: m.label,
            Item: i.title,
            "Sub-item Of": i.parentItemId ? item.title : null,
            Owner: label(i.owner),
            Priority: label(i.priority),
            Done: yesNo(i.completed),
            Notes: i.notes,
          })),
        ),
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Wedding Checklist</h1>
          <p className="text-muted-foreground text-sm">
            Organized by how many months out each task belongs to.
          </p>
        </div>
        <ExportButton filename="wedding-checklist" sheets={exportSheets} />
      </div>
      <ChecklistBoard milestones={milestones} />
    </div>
  );
}
