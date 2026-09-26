import { getTasks, getProfiles } from "./queries";
import { TaskBoard } from "./task-board";
import { AddTaskButton } from "./task-dialog";
import { ExportButton } from "@/components/export-button";
import { dateOnly, label, yesNo } from "@/lib/export";

export default async function WorkPage() {
  const [tasks, profiles] = await Promise.all([getTasks(), getProfiles()]);
  const openCount = tasks.filter((t) => !t.completed).length;

  const exportSheets = [
    {
      name: "Work Tasks",
      rows: tasks.map((t) => ({
        Task: t.title,
        Done: yesNo(t.completed),
        Due: dateOnly(t.dueDate),
        Priority: label(t.priority),
        Who: t.profile?.name,
        Notes: t.notes,
        Created: t.createdAt,
      })),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Work</h1>
          <p className="text-muted-foreground text-sm">{openCount} open</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ExportButton filename="work" sheets={exportSheets} />
          <AddTaskButton profiles={profiles} />
        </div>
      </div>
      <TaskBoard tasks={tasks} profiles={profiles} />
    </div>
  );
}
