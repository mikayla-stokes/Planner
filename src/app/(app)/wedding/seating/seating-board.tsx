"use client";

import { useMemo, useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { moveGuestTable } from "../guests/actions";
import type { SeatingTable, Guest } from "@/generated/prisma/client";

const UNASSIGNED = "UNASSIGNED";

export function SeatingBoard({ tables, guests }: { tables: SeatingTable[]; guests: Guest[] }) {
  const [liveGuests, setLiveGuests] = useState(guests);

  // Keep each guest under its current table client-side so a move is reflected
  // immediately without waiting on a full page refetch.
  const grouped = useMemo(() => {
    const byTable = new Map<string, Guest[]>();
    const unassigned: Guest[] = [];
    for (const g of liveGuests) {
      if (!g.tableId) {
        unassigned.push(g);
        continue;
      }
      if (!byTable.has(g.tableId)) byTable.set(g.tableId, []);
      byTable.get(g.tableId)!.push(g);
    }
    return { byTable, unassigned };
  }, [liveGuests]);

  function handleMove(guestId: string, tableId: string | null) {
    setLiveGuests((prev) => prev.map((g) => (g.id === guestId ? { ...g, tableId } : g)));
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {tables.map((table) => {
        const tableGuests = grouped.byTable.get(table.id) ?? [];
        return (
          <Card key={table.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{table.name}</CardTitle>
                <Badge variant="secondary">{tableGuests.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {tableGuests.map((g) => (
                <RowWithLocalMove key={g.id} guest={g} tables={tables} onMove={handleMove} />
              ))}
              {tableGuests.length === 0 && (
                <p className="text-muted-foreground text-xs">No one assigned yet.</p>
              )}
            </CardContent>
          </Card>
        );
      })}

      <Card className="border-dashed">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Unassigned</CardTitle>
            <Badge variant="secondary">{grouped.unassigned.length}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {grouped.unassigned.map((g) => (
            <RowWithLocalMove key={g.id} guest={g} tables={tables} onMove={handleMove} />
          ))}
          {grouped.unassigned.length === 0 && (
            <p className="text-muted-foreground text-xs">Everyone has a seat.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function RowWithLocalMove({
  guest,
  tables,
  onMove,
}: {
  guest: Guest;
  tables: SeatingTable[];
  onMove: (guestId: string, tableId: string | null) => void;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-between gap-2 py-0.5">
      <span className="flex items-center gap-1.5 text-sm">
        {guest.firstName} {guest.lastName}
        {guest.needsReview && (
          <Badge variant="outline" className="text-[10px]">
            review
          </Badge>
        )}
      </span>
      <Select
        value={guest.tableId ?? UNASSIGNED}
        onValueChange={(v) => {
          const previous = guest.tableId;
          const next = v === UNASSIGNED ? null : v;
          onMove(guest.id, next);
          startTransition(async () => {
            try {
              await moveGuestTable(guest.id, next);
            } catch {
              onMove(guest.id, previous); // save failed — don't leave the UI showing an unsaved state
            }
          });
        }}
      >
        <SelectTrigger size="sm" className={`w-36 text-xs ${pending ? "opacity-60" : ""}`}>
          <SelectValue>
            {(v: string) => (v === UNASSIGNED ? "Unassigned" : (tables.find((t) => t.id === v)?.name ?? v))}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
          {tables.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              {t.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
