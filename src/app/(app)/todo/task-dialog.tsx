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
import { createTask, updateTask, deleteTask, type TaskInput } from "./actions";
import type { Priority } from "@/generated/prisma/enums";
import type { getTasks, getProfiles } from "./queries";

type ExistingTask = Awaited<ReturnType<typeof getTasks>>[number];
type Profiles = Awaited<ReturnType<typeof getProfiles>>;

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
  priority: Priority | "NONE";
  dueDate: string;
  profileId: string;
};

function emptyForm(): FormState {
  return { title: "", notes: "", priority: "NONE", dueDate: "", profileId: UNASSIGNED };
}

function taskToForm(t: ExistingTask): FormState {
  return {
    title: t.title,
    notes: t.notes ?? "",
    priority: t.priority ?? "NONE",
    dueDate: t.dueDate ? t.dueDate.toISOString().slice(0, 10) : "",
    profileId: t.profileId ?? UNASSIGNED,
  };
}

function toInput(form: FormState): TaskInput {
  return {
    title: form.title,
    notes: form.notes,
    priority: form.priority === "NONE" ? null : form.priority,
    dueDate: form.dueDate || undefined,
    profileId: form.profileId === UNASSIGNED ? null : form.profileId,
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
        <Label htmlFor="task-title">Title</Label>
        <Input
          id="task-title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          autoFocus
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
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
          <Label>Owner</Label>
          <Select
            value={form.profileId}
            onValueChange={(v) => setForm({ ...form, profileId: v ?? UNASSIGNED })}
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
        <Label htmlFor="task-due">Due date (optional)</Label>
        <Input
          id="task-due"
          type="date"
          value={form.dueDate}
          onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="task-notes">Notes (optional)</Label>
        <Textarea id="task-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </div>
    </div>
  );
}

export function AddTaskButton({ profiles }: { profiles: Profiles }) {
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
        <Plus className="size-3.5" /> Add task
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add task</DialogTitle>
        </DialogHeader>
        <Fields form={form} setForm={setForm} profiles={profiles} />
        <DialogFooter>
          <Button
            type="button"
            disabled={!form.title.trim() || pending}
            onClick={() => {
              startTransition(async () => {
                await createTask(toInput(form));
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

export function EditTaskButton({ task, profiles }: { task: ExistingTask; profiles: Profiles }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(() => taskToForm(task));
  const [pending, startTransition] = useTransition();

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) setForm(taskToForm(task));
      }}
    >
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground size-6"
            aria-label={`Edit ${task.title}`}
          />
        }
      >
        <Pencil className="size-3.5" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit task</DialogTitle>
        </DialogHeader>
        <Fields form={form} setForm={setForm} profiles={profiles} />
        <DialogFooter className="flex-row justify-between sm:justify-between">
          <ConfirmDeleteButton
            itemLabel={task.title}
            size="sm"
            onConfirm={async () => {
              await deleteTask(task.id);
              setOpen(false);
            }}
          />
          <Button
            type="button"
            disabled={!form.title.trim() || pending}
            onClick={() => {
              startTransition(async () => {
                await updateTask(task.id, toInput(form));
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
