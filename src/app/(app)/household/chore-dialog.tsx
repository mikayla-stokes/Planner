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
import { createChore, updateChore, deleteChore, type ChoreInput } from "./actions";
import type { Priority, RecurrenceFrequency } from "@/generated/prisma/enums";
import type { getChores, getProfiles } from "./queries";

type ExistingChore = Awaited<ReturnType<typeof getChores>>[number];
type Profiles = Awaited<ReturnType<typeof getProfiles>>;

const FREQUENCIES: RecurrenceFrequency[] = ["DAILY", "WEEKLY", "MONTHLY"];
const FREQUENCY_LABELS: Record<RecurrenceFrequency, string> = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
};

const PRIORITIES: (Priority | "NONE")[] = ["NONE", "HIGH", "MEDIUM", "LOW"];
const PRIORITY_LABELS: Record<Priority | "NONE", string> = {
  NONE: "No priority",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

const UNASSIGNED = "UNASSIGNED";

type FormState = {
  title: string;
  notes: string;
  frequency: RecurrenceFrequency;
  priority: Priority | "NONE";
  assigneeId: string;
};

function emptyForm(): FormState {
  return { title: "", notes: "", frequency: "WEEKLY", priority: "NONE", assigneeId: UNASSIGNED };
}

function choreToForm(c: ExistingChore): FormState {
  return {
    title: c.title,
    notes: c.notes ?? "",
    frequency: c.frequency,
    priority: c.priority ?? "NONE",
    assigneeId: c.assigneeId ?? UNASSIGNED,
  };
}

function toInput(form: FormState): ChoreInput {
  return {
    title: form.title,
    notes: form.notes,
    frequency: form.frequency,
    priority: form.priority === "NONE" ? null : form.priority,
    assigneeId: form.assigneeId === UNASSIGNED ? null : form.assigneeId,
  };
}

function Fields({
  form,
  setForm,
  profiles,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
  profiles: Profiles;
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="chore-title">Title</Label>
        <Input
          id="chore-title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          autoFocus
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label>Frequency</Label>
          <Select
            value={form.frequency}
            onValueChange={(v) => setForm({ ...form, frequency: v as RecurrenceFrequency })}
          >
            <SelectTrigger className="w-full">
              <SelectValue>{(v: RecurrenceFrequency) => FREQUENCY_LABELS[v]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {FREQUENCIES.map((f) => (
                <SelectItem key={f} value={f}>
                  {FREQUENCY_LABELS[f]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Assignee</Label>
          <Select
            value={form.assigneeId}
            onValueChange={(v) => setForm({ ...form, assigneeId: v ?? UNASSIGNED })}
          >
            <SelectTrigger className="w-full">
              <SelectValue>
                {(v: string) => (v === UNASSIGNED ? "Either" : (profiles.find((p) => p.id === v)?.name ?? v))}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UNASSIGNED}>Either</SelectItem>
              {profiles.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Priority</Label>
        <Select
          value={form.priority}
          onValueChange={(v) => setForm({ ...form, priority: v as Priority | "NONE" })}
        >
          <SelectTrigger className="w-full">
            <SelectValue>{(v: Priority | "NONE") => PRIORITY_LABELS[v]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {PRIORITIES.map((p) => (
              <SelectItem key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="chore-notes">Notes (optional)</Label>
        <Textarea id="chore-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </div>
    </div>
  );
}

export function AddChoreButton({ profiles }: { profiles: Profiles }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [pending, startTransition] = useTransition();

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setForm(emptyForm());
      }}
    >
      <DialogTrigger render={<Button type="button" size="sm" className="gap-1" />}>
        <Plus className="size-3.5" /> Add chore
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add chore</DialogTitle>
        </DialogHeader>
        <Fields form={form} setForm={setForm} profiles={profiles} />
        <DialogFooter>
          <Button
            type="button"
            disabled={!form.title.trim() || pending}
            onClick={() => {
              startTransition(async () => {
                await createChore(toInput(form));
                setOpen(false);
                setForm(emptyForm());
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

export function EditChoreButton({ chore, profiles }: { chore: ExistingChore; profiles: Profiles }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(() => choreToForm(chore));
  const [pending, startTransition] = useTransition();

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) setForm(choreToForm(chore));
      }}
    >
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground size-6"
            aria-label={`Edit ${chore.title}`}
          />
        }
      >
        <Pencil className="size-3.5" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit chore</DialogTitle>
        </DialogHeader>
        <Fields form={form} setForm={setForm} profiles={profiles} />
        <DialogFooter className="flex-row justify-between sm:justify-between">
          <ConfirmDeleteButton
            itemLabel={chore.title}
            size="sm"
            onConfirm={async () => {
              await deleteChore(chore.id);
              setOpen(false);
            }}
          />
          <Button
            type="button"
            disabled={!form.title.trim() || pending}
            onClick={() => {
              startTransition(async () => {
                await updateChore(chore.id, toInput(form));
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
