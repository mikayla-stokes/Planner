"use client";

import { useMemo, useState } from "react";
import type { getGuests, getSeatingTables } from "./queries";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditGuestButton } from "./guest-form-sheet";

type Guests = Awaited<ReturnType<typeof getGuests>>;
type Tables = Awaited<ReturnType<typeof getSeatingTables>>;

const RSVP_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  YES: "default",
  NO: "destructive",
  PENDING: "outline",
};

export function GuestTable({ guests, tables }: { guests: Guests; tables: Tables }) {
  const [query, setQuery] = useState("");
  const [onlyReview, setOnlyReview] = useState<"all" | "review">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return guests.filter((g) => {
      if (onlyReview === "review" && !g.needsReview) return false;
      if (!q) return true;
      const haystack = `${g.firstName} ${g.lastName} ${g.notes ?? ""} ${g.role ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [guests, query, onlyReview]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Search guests…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="sm:max-w-xs"
        />
        <Tabs value={onlyReview} onValueChange={(v) => setOnlyReview(v as typeof onlyReview)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="review">Needs Review</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-2">
        {filtered.map((guest) => (
          <Card key={guest.id} className={guest.needsReview ? "border-primary/40" : undefined}>
            <CardContent className="flex items-start justify-between gap-3 py-3">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-medium">
                    {guest.firstName} {guest.lastName}
                  </span>
                  {guest.isWeddingParty && (
                    <Badge variant="secondary" className="text-[10px]">
                      {guest.weddingPartyRole}
                    </Badge>
                  )}
                  {guest.isKid && (
                    <Badge variant="outline" className="text-[10px]">
                      Kid
                    </Badge>
                  )}
                  {guest.needsReview && (
                    <Badge className="text-[10px]">Needs Review</Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-xs">
                  {guest.type.replace("_", " ")} · Hosted by {guest.host.toLowerCase()}
                  {guest.table ? ` · ${guest.table.name}` : ""}
                </p>
                <p className="text-muted-foreground text-xs">
                  {guest.events.join(", ")}
                </p>
                {guest.needsReview && guest.reviewNote && (
                  <p className="text-xs italic">Was: {guest.reviewNote}</p>
                )}
                {(guest.phone || guest.email) && (
                  <p className="text-muted-foreground text-xs">
                    {[guest.phone, guest.email].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <Badge variant={RSVP_VARIANT[guest.rsvpStatus] ?? "outline"}>
                  {guest.rsvpStatus === "PENDING" ? "Pending" : guest.rsvpStatus}
                </Badge>
                <EditGuestButton guest={guest} tables={tables} />
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="text-muted-foreground py-8 text-center text-sm">No guests match.</p>
        )}
      </div>
    </div>
  );
}
