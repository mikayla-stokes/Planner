import { db } from "@/lib/db";
import { daysUntil } from "@/lib/dates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { NotesForm } from "./notes-form";
import type { ChecklistOwner, Priority } from "@/generated/prisma/enums";

function formatMoney(value: unknown) {
  const n = Number(value ?? 0);
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

const PRIORITY_VARIANT: Record<Priority, "default" | "secondary" | "outline"> = {
  HIGH: "default",
  MEDIUM: "secondary",
  LOW: "outline",
};

const PRIORITY_RANK: Record<Priority, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

function belongsTo(owner: ChecklistOwner, person: "MIKAYLA" | "CALEB") {
  return owner === person || owner === "SHARED";
}

function PriorityList({ title, items }: { title: string; items: { id: string; title: string; priority: Priority }[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {items.length === 0 && <p className="text-muted-foreground text-sm">Nothing high priority right now.</p>}
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-2 text-sm">
            <span>{item.title}</span>
            <Badge variant={PRIORITY_VARIANT[item.priority]} className="shrink-0 text-[10px]">
              {item.priority}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default async function WeddingOverviewPage() {
  const [wedding, totalItems, completedItems, guestCount, needsReviewCount, budgetItems, priorityItems] =
    await Promise.all([
      db.wedding.findFirst(),
      db.checklistItem.count(),
      db.checklistItem.count({ where: { completed: true } }),
      db.guest.count(),
      db.guest.count({ where: { needsReview: true } }),
      db.weddingBudgetItem.findMany(),
      db.checklistItem.findMany({
        where: { completed: false, priority: { not: null }, parentItemId: null },
        select: { id: true, title: true, priority: true, owner: true },
      }),
    ]);

  const progressPct = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);
  const totalBudget = budgetItems.reduce((sum, item) => sum + Number(item.budget ?? item.estimatedCost ?? 0), 0);
  const totalPaid = budgetItems.reduce((sum, item) => sum + Number(item.amountPaid ?? 0), 0);

  const sortedPriorityItems = [...priorityItems].sort(
    (a, b) => PRIORITY_RANK[a.priority!] - PRIORITY_RANK[b.priority!] || a.title.localeCompare(b.title),
  ) as { id: string; title: string; priority: Priority; owner: ChecklistOwner }[];
  const mikaylaPriorities = sortedPriorityItems.filter((i) => belongsTo(i.owner, "MIKAYLA"));
  const calebPriorities = sortedPriorityItems.filter((i) => belongsTo(i.owner, "CALEB"));

  const daysToGo = wedding ? daysUntil(wedding.weddingDate) : null;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {wedding ? `${wedding.brideName} & ${wedding.groomName}` : "Wedding Planning"}
        </h1>
        {wedding && (
          <p className="text-muted-foreground text-sm">
            {wedding.weddingDate.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
            {daysToGo !== null && daysToGo > 0 ? ` · ${daysToGo} days to go` : null}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-2xl font-semibold">{progressPct}%</p>
            <Progress value={progressPct} />
            <p className="text-muted-foreground text-xs">
              {completedItems} of {totalItems} done
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">Guests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-2xl font-semibold">{guestCount}</p>
            <p className="text-muted-foreground text-xs">
              {needsReviewCount > 0 ? `${needsReviewCount} need review` : "All reconciled"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">
              {formatMoney(totalPaid)} paid of {formatMoney(totalBudget)} budgeted
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">Venue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">{wedding?.venueName ?? "—"}</p>
            <p className="text-muted-foreground text-xs">{wedding?.receptionLocation}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <PriorityList title="Mikayla's Priorities" items={mikaylaPriorities} />
        <PriorityList title="Caleb's Priorities" items={calebPriorities} />
      </div>

      {wedding && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <NotesForm weddingId={wedding.id} initialNotes={wedding.notes ?? ""} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
