import { getChores, getHomeProjects, getProfiles } from "./queries";
import { ChoresList } from "./chores-list";
import { ProjectsList } from "./projects-list";
import { AddChoreButton } from "./chore-dialog";
import { AddProjectButton } from "./project-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { choreStatusLabel, isChoreDue } from "./due-status";
import { ExportButton } from "@/components/export-button";
import { dateOnly, label, yesNo } from "@/lib/export";

export default async function HouseholdPage() {
  const [chores, projects, profiles] = await Promise.all([
    getChores(),
    getHomeProjects(),
    getProfiles(),
  ]);
  const dueCount = chores.filter((c) => isChoreDue(c.frequency, c.lastCompletedAt)).length;
  const openProjects = projects.filter((p) => !p.completed).length;

  const exportSheets = [
    {
      name: "Chores",
      rows: chores.map((c) => ({
        Chore: c.title,
        Frequency: label(c.frequency),
        Status: choreStatusLabel(c.frequency, c.lastCompletedAt),
        "Last Done": c.lastCompletedAt,
        Priority: label(c.priority),
        Assignee: c.assignee?.name,
        Notes: c.notes,
      })),
    },
    {
      name: "Projects",
      rows: projects.map((p) => ({
        Project: p.title,
        Done: yesNo(p.completed),
        Due: dateOnly(p.dueDate),
        Priority: label(p.priority),
        Notes: p.notes,
      })),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Household</h1>
          <p className="text-muted-foreground text-sm">
            {dueCount} chores due · {openProjects} open projects
          </p>
        </div>
        <ExportButton filename="household" sheets={exportSheets} />
      </div>

      <Tabs defaultValue="chores">
        <TabsList>
          <TabsTrigger value="chores">Chores</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>
        <TabsContent value="chores" className="space-y-3">
          <div className="flex justify-end">
            <AddChoreButton profiles={profiles} />
          </div>
          <ChoresList chores={chores} profiles={profiles} />
        </TabsContent>
        <TabsContent value="projects" className="space-y-3">
          <div className="flex justify-end">
            <AddProjectButton />
          </div>
          <ProjectsList projects={projects} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
