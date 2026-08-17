import Link from "next/link";
import { db } from "@/lib/db";
import { daysUntil } from "@/lib/dates";
import { isChoreDue } from "./household/due-status";
import { todayDateOnly } from "./calendar/date-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuickAddTask } from "./quick-add-task";

export default async function DashboardPage() {
  const [dueTasks, dueWorkTasks, allChores, wedding, checklistTotal, checklistDone, upcomingEvents] = await Promise.all([
    db.task.findMany({
      where: { listType: "GENERAL", completed: false },
      orderBy: [{ dueDate: { sort: "asc", nulls: "last" } }, { createdAt: "asc" }],
      take: 5,
    }),
    db.task.findMany({
      where: { listType: "WORK", completed: false },
      orderBy: [{ dueDate: { sort: "asc", nulls: "last" } }, { createdAt: "asc" }],
      take: 5,
    }),
    db.chore.findMany({ orderBy: { createdAt: "asc" } }),
    db.wedding.findFirst(),
    db.checklistItem.count(),
    db.checklistItem.count({ where: { completed: true } }),
    db.calendarEvent.findMany({
      where: { date: { gte: todayDateOnly() } },
      orderBy: [{ date: "asc" }, { createdAt: "asc" }],
      take: 3,
    }),
  ]);

  const dueChores = allChores.filter((c) => isChoreDue(c.frequency, c.lastCompletedAt)).slice(0, 5);
  const daysToGo = wedding ? daysUntil(wedding.weddingDate) : null;
  const checklistPct = checklistTotal === 0 ? 0 : Math.round((checklistDone / checklistTotal) * 100);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Today</h1>
          <p className="text-muted-foreground text-sm">Your at-a-glance view across everything.</p>
        </div>
        <QuickAddTask />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            <Link href="/todo" className="hover:underline">
              To-Do {dueTasks.length > 0 ? `— ${dueTasks.length} open` : ""}
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {dueTasks.length === 0 && <p className="text-muted-foreground text-sm">Nothing on your list. 🎉</p>}
          {dueTasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between text-sm">
              <span>{task.title}</span>
              {task.dueDate && (
                <span className="text-muted-foreground text-xs">
                  {task.dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            <Link href="/work" className="hover:underline">
              Work {dueWorkTasks.length > 0 ? `— ${dueWorkTasks.length} open` : ""}
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {dueWorkTasks.length === 0 && <p className="text-muted-foreground text-sm">Nothing on your list. 🎉</p>}
          {dueWorkTasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between text-sm">
              <span>{task.title}</span>
              {task.dueDate && (
                <span className="text-muted-foreground text-xs">
                  {task.dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            <Link href="/household" className="hover:underline">
              Household {dueChores.length > 0 ? `— ${dueChores.length} chore${dueChores.length === 1 ? "" : "s"} due` : ""}
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {dueChores.length === 0 && <p className="text-muted-foreground text-sm">All caught up. 🎉</p>}
          {dueChores.map((chore) => (
            <div key={chore.id} className="flex items-center justify-between text-sm">
              <span>{chore.title}</span>
              <Badge variant="outline" className="text-[10px]">
                {chore.frequency.charAt(0) + chore.frequency.slice(1).toLowerCase()}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            <Link href="/wedding" className="hover:underline">
              Wedding
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          {wedding ? (
            <p>
              {daysToGo !== null && daysToGo > 0 ? `${daysToGo} days to go · ` : ""}
              Checklist {checklistPct}% done
            </p>
          ) : (
            <p>No wedding details yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            <Link href="/calendar" className="hover:underline">
              Calendar {upcomingEvents.length > 0 ? `— next ${upcomingEvents.length}` : ""}
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {upcomingEvents.length === 0 && <p className="text-muted-foreground text-sm">Nothing upcoming on the calendar.</p>}
          {upcomingEvents.map((event) => (
            <div key={event.id} className="flex items-center justify-between text-sm">
              <span>{event.title}</span>
              <span className="text-muted-foreground text-xs">
                {event.date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}
                {event.time ? ` · ${event.time}` : ""}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
