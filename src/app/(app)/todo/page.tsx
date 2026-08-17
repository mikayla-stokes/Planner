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

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">To-Do</h1>
          <p className="text-muted-foreground text-sm">{openCount} open</p>
        </div>
        <AddTaskButton profiles={profiles} />
      </div>
      <TaskBoard tasks={tasks} profiles={profiles} />

      <HouseholdPriorities projects={householdPriorities} />
      <WorkPriorities tasks={workPriorities} profiles={profiles} />
      <WeddingPriorities items={weddingPriorities} milestoneId={weddingMilestoneId} />
    </div>
  );
}
