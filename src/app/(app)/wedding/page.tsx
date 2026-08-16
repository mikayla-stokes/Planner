import Link from "next/link";
import { db } from "@/lib/db";
import { daysUntil } from "@/lib/dates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

function formatMoney(value: unknown) {
  const n = Number(value ?? 0);
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default async function WeddingOverviewPage() {
  const [wedding, totalItems, completedItems, guestCount, needsReviewCount, budgetItems] =
    await Promise.all([
      db.wedding.findFirst(),
      db.checklistItem.count(),
      db.checklistItem.count({ where: { completed: true } }),
      db.guest.count(),
      db.guest.count({ where: { needsReview: true } }),
      db.weddingBudgetItem.findMany(),
    ]);

  const progressPct = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);
  const totalBudget = budgetItems.reduce((sum, item) => sum + Number(item.budget ?? item.estimatedCost ?? 0), 0);
  const totalPaid = budgetItems.reduce((sum, item) => sum + Number(item.amountPaid ?? 0), 0);

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
          <CardContent className="space-y-1">
            <p className="text-2xl font-semibold">{formatMoney(totalPaid)}</p>
            <p className="text-muted-foreground text-xs">of {formatMoney(totalBudget)} budgeted</p>
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

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {[
          { href: "/wedding/checklist", label: "Checklist" },
          { href: "/wedding/guests", label: "Guest List" },
          { href: "/wedding/seating", label: "Seating Chart" },
          { href: "/wedding/vendors", label: "Vendors" },
          { href: "/wedding/budget", label: "Budget" },
          { href: "/wedding/timeline", label: "Timeline" },
          { href: "/wedding/packing", label: "Packing Lists" },
        ].map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="hover:border-primary/40 transition-colors">
              <CardContent className="py-4 text-center text-sm font-medium">
                {link.label}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
