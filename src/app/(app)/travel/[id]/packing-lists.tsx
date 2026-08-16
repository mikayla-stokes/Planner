"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { cn } from "@/lib/utils";
import {
  createPackingList,
  deletePackingList,
  createPackingItem,
  togglePackingItem,
  deletePackingItem,
} from "./packing-actions";

type PackingItem = { id: string; text: string; checked: boolean };
type PackingList = { id: string; name: string; items: PackingItem[] };
type Candidate = { id: string; name: string; tripId: string | null; trip: { name: string } | null; items: PackingItem[] };

const NONE = "NONE";

function AddListDialog({ tripId, candidates }: { tripId: string; candidates: Candidate[] }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [duplicateFrom, setDuplicateFrom] = useState(NONE);
  const [pending, startTransition] = useTransition();

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setName("");
          setDuplicateFrom(NONE);
        }
      }}
    >
      <DialogTrigger render={<Button type="button" size="sm" className="gap-1" />}>
        <Plus className="size-3.5" /> Add packing list
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add packing list</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Input placeholder="List name, e.g. Carry-on" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          {candidates.length > 0 && (
            <div className="space-y-1.5">
              <Select value={duplicateFrom} onValueChange={(v) => setDuplicateFrom(v ?? NONE)}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(v: string) =>
                      v === NONE
                        ? "Start blank"
                        : (() => {
                            const c = candidates.find((c) => c.id === v);
                            return c ? `Copy from "${c.name}"${c.trip ? ` (${c.trip.name})` : ""}` : "Start blank";
                          })()
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Start blank</SelectItem>
                  {candidates.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                      {c.trip ? ` (${c.trip.name})` : ""} — {c.items.length} items
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            disabled={!name.trim() || pending}
            onClick={() => {
              startTransition(async () => {
                await createPackingList(tripId, name.trim(), duplicateFrom === NONE ? undefined : duplicateFrom);
                setOpen(false);
                setName("");
                setDuplicateFrom(NONE);
              });
            }}
          >
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ItemRow({ item, tripId }: { item: PackingItem; tripId: string }) {
  const [checked, setChecked] = useState(item.checked);
  const [pending, startTransition] = useTransition();

  return (
    <div className={cn("flex items-center gap-2.5 py-1", pending && "opacity-60")}>
      <Checkbox
        checked={checked}
        onCheckedChange={(v) => {
          const next = v === true;
          setChecked(next);
          startTransition(async () => {
            try {
              await togglePackingItem(item.id, tripId, next);
            } catch {
              setChecked(!next);
            }
          });
        }}
      />
      <span className={cn("flex-1 text-sm", checked && "text-muted-foreground line-through")}>{item.text}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-destructive size-6"
        aria-label={`Remove ${item.text}`}
        onClick={() => startTransition(async () => await deletePackingItem(item.id, tripId))}
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  );
}

function AddItemRow({ listId, tripId }: { listId: string; tripId: string }) {
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();

  function submit() {
    const trimmed = text.trim();
    if (!trimmed) return;
    startTransition(async () => {
      await createPackingItem(listId, tripId, trimmed);
      setText("");
    });
  }

  return (
    <div className="flex gap-1.5 pt-1">
      <Input
        placeholder="Add item…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submit();
          }
        }}
      />
      <Button type="button" size="icon" disabled={!text.trim() || pending} onClick={submit} aria-label="Add packing item">
        <Plus className="size-4" />
      </Button>
    </div>
  );
}

export function PackingLists({
  tripId,
  lists,
  candidates,
}: {
  tripId: string;
  lists: PackingList[];
  candidates: Candidate[];
}) {
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <AddListDialog tripId={tripId} candidates={candidates} />
      </div>
      {lists.map((list) => (
        <Card key={list.id}>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">{list.name}</CardTitle>
            <ConfirmDeleteButton itemLabel={list.name} onConfirm={async () => await deletePackingList(list.id, tripId)} />
          </CardHeader>
          <CardContent>
            {list.items.map((item) => (
              <ItemRow key={item.id} item={item} tripId={tripId} />
            ))}
            <AddItemRow listId={list.id} tripId={tripId} />
          </CardContent>
        </Card>
      ))}
      {lists.length === 0 && (
        <p className="text-muted-foreground py-4 text-center text-sm">No packing lists yet.</p>
      )}
    </div>
  );
}
