import { getChores, getHomeProjects, getProfiles } from "./queries";
import { ChoresList } from "./chores-list";
import { ProjectsList } from "./projects-list";
import { AddChoreButton } from "./chore-dialog";
import { AddProjectButton } from "./project-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { isChoreDue } from "./due-status";

export default async function HouseholdPage() {
  const [chores, projects, profiles] = await Promise.all([
    getChores(),
    getHomeProjects(),
    getProfiles(),
  ]);
  const dueCount = chores.filter((c) => isChoreDue(c.frequency, c.lastCompletedAt)).length;
  const openProjects = projects.filter((p) => !p.completed).length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Household</h1>
        <p className="text-muted-foreground text-sm">
          {dueCount} chores due · {openProjects} open projects
        </p>
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
