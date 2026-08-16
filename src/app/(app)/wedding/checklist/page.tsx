import { ChecklistBoard } from "./checklist-board";
import { getMilestonesWithItems } from "./queries";

export default async function ChecklistPage() {
  const milestones = await getMilestonesWithItems();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Wedding Checklist</h1>
        <p className="text-muted-foreground text-sm">
          Organized by how many months out each task belongs to.
        </p>
      </div>
      <ChecklistBoard milestones={milestones} />
    </div>
  );
}
