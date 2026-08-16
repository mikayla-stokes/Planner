"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { createChecklistItem, updateChecklistItem, deleteChecklistItem } from "./actions";
import type { ChecklistOwner } from "@/generated/prisma/enums";

const OWNERS: ChecklistOwner[] = ["SHARED", "MIKAYLA", "CALEB", "UNDECIDED"];
const OWNER_LABELS: Record<ChecklistOwner, string> = {
  SHARED: "Shared",
  MIKAYLA: "Mikayla",
  CALEB: "Caleb",
  UNDECIDED: "Undecided",
};

type ExistingItem = { id: string; title: string; owner: ChecklistOwner; notes: string | null };

export function AddChecklistItemButton({ milestoneId }: { milestoneId: string }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [owner, setOwner] = useState<ChecklistOwner>("SHARED");
  const [notes, setNotes] = useState("");
  const [pending, startTransition] = useTransition();

  function reset() {
    setTitle("");
    setOwner("SHARED");
    setNotes("");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger render={<Button type="button" variant="ghost" size="sm" className="gap-1" />}>
        <Plus className="size-3.5" /> Add task
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add task</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="new-title">Title</Label>
            <Input id="new-title" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label>Owner</Label>
            <Select value={owner} onValueChange={(v) => setOwner(v as ChecklistOwner)}>
              <SelectTrigger className="w-full">
                <SelectValue>{(v: ChecklistOwner) => OWNER_LABELS[v]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {OWNERS.map((o) => (
                  <SelectItem key={o} value={o}>
                    {OWNER_LABELS[o]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-notes">Notes (optional)</Label>
            <Textarea id="new-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            disabled={!title.trim() || pending}
            onClick={() => {
              startTransition(async () => {
                // No parentItemId — this is always a top-level task, appended to
                // the end of the section (new items sort last by creation time).
                await createChecklistItem({ milestoneId, title: title.trim(), owner, notes });
                setOpen(false);
                reset();
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

export function EditChecklistItemButton({ item }: { item: ExistingItem }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [owner, setOwner] = useState<ChecklistOwner>(item.owner);
  const [notes, setNotes] = useState(item.notes ?? "");
  const [pending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground size-6"
            aria-label={`Edit ${item.title}`}
          />
        }
      >
        <Pencil className="size-3.5" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit task</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="edit-title">Title</Label>
            <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Owner</Label>
            <Select value={owner} onValueChange={(v) => setOwner(v as ChecklistOwner)}>
              <SelectTrigger className="w-full">
                <SelectValue>{(v: ChecklistOwner) => OWNER_LABELS[v]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {OWNERS.map((o) => (
                  <SelectItem key={o} value={o}>
                    {OWNER_LABELS[o]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-notes">Notes (optional)</Label>
            <Textarea id="edit-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter className="flex-row justify-between sm:justify-between">
          <ConfirmDeleteButton
            itemLabel={item.title}
            size="sm"
            onConfirm={async () => {
              await deleteChecklistItem(item.id);
              setOpen(false);
            }}
          />
          <Button
            type="button"
            disabled={!title.trim() || pending}
            onClick={() => {
              startTransition(async () => {
                await updateChecklistItem({ id: item.id, title: title.trim(), owner, notes });
                setOpen(false);
              });
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
