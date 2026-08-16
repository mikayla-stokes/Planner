import { getTasks, getProfiles } from "./queries";
import { TaskBoard } from "./task-board";
import { AddTaskButton } from "./task-dialog";

export default async function WorkPage() {
  const [tasks, profiles] = await Promise.all([getTasks(), getProfiles()]);
  const openCount = tasks.filter((t) => !t.completed).length;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Work</h1>
          <p className="text-muted-foreground text-sm">{openCount} open</p>
        </div>
        <AddTaskButton profiles={profiles} />
      </div>
      <TaskBoard tasks={tasks} profiles={profiles} />
    </div>
  );
}
