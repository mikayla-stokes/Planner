import {
  getTasks,
  getProfiles,
  getHouseholdPriorities,
  getWorkPriorities,
  getWeddingPriorities,
  getWeddingPriorityMilestoneId,
} from "./queries";
import { TaskBoard } from "./task-board";
import { AddTaskButton } from "./task-dialog";
import { HouseholdPriorities } from "./household-priorities";
import { WorkPriorities } from "./work-priorities";
import { WeddingPriorities } from "./wedding-priorities";
import { ExportButton } from "@/components/export-button";
import { dateOnly, label, yesNo } from "@/lib/export";

export default async function TodoPage() {
  const [tasks, profiles, householdPriorities, workPriorities, weddingPriorities, weddingMilestoneId] =
    await Promise.all([
      getTasks(),
      getProfiles(),
      getHouseholdPriorities(),
      getWorkPriorities(),
      getWeddingPriorities(),
      getWeddingPriorityMilestoneId(),
    ]);
  const openCount = tasks.filter((t) => !t.completed).length;

  const exportSheets = [
    {
      name: "Tasks",
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
    {
      name: "Household Priorities",
      rows: householdPriorities.map((i) =>
        i.kind === "project"
          ? { Item: i.project.title, Type: "Project", Priority: label(i.priority), Due: dateOnly(i.project.dueDate), Who: null, Notes: i.project.notes }
          : { Item: i.chore.title, Type: "Chore", Priority: label(i.priority), Due: "Due now", Who: i.chore.assignee?.name, Notes: i.chore.notes },
      ),
    },
    {
      name: "Work Priorities",
      rows: workPriorities.map((t) => ({
        Task: t.title,
        Priority: label(t.priority),
        Due: dateOnly(t.dueDate),
        Who: t.profile?.name,
        Notes: t.notes,
      })),
    },
    {
      name: "Wedding Priorities",
      rows: weddingPriorities.map((i) => ({ Item: i.title, Priority: label(i.priority), Owner: label(i.owner), Notes: i.notes })),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">To-Do</h1>
          <p className="text-muted-foreground text-sm">{openCount} open</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ExportButton filename="to-do" sheets={exportSheets} />
          <AddTaskButton profiles={profiles} />
        </div>
      </div>
      <TaskBoard tasks={tasks} profiles={profiles} />

      <HouseholdPriorities items={householdPriorities} profiles={profiles} />
      <WorkPriorities tasks={workPriorities} profiles={profiles} />
      <WeddingPriorities items={weddingPriorities} milestoneId={weddingMilestoneId} />
    </div>
  );
}
