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
import { createHomeProject, updateHomeProject, deleteHomeProject, type HomeProjectInput } from "./actions";
import type { Priority } from "@/generated/prisma/enums";
import type { getHomeProjects } from "./queries";

type ExistingProject = Awaited<ReturnType<typeof getHomeProjects>>[number];

const PRIORITIES: (Priority | "NONE")[] = ["NONE", "HIGH", "MEDIUM", "LOW"];
const PRIORITY_LABELS: Record<Priority | "NONE", string> = {
  NONE: "No priority",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

type FormState = { title: string; notes: string; priority: Priority | "NONE"; dueDate: string };

function emptyForm(): FormState {
  return { title: "", notes: "", priority: "NONE", dueDate: "" };
}

function projectToForm(p: ExistingProject): FormState {
  return {
    title: p.title,
    notes: p.notes ?? "",
    priority: p.priority ?? "NONE",
    dueDate: p.dueDate ? p.dueDate.toISOString().slice(0, 10) : "",
  };
}

function toInput(form: FormState): HomeProjectInput {
  return {
    title: form.title,
    notes: form.notes,
    priority: form.priority === "NONE" ? null : form.priority,
    dueDate: form.dueDate || undefined,
  };
}

function Fields({ form, setForm }: { form: FormState; setForm: (f: FormState) => void }) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="project-title">Title</Label>
        <Input
          id="project-title"
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
          <Label htmlFor="project-due">Due date</Label>
          <Input
            id="project-due"
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="project-notes">Notes (optional)</Label>
        <Textarea
          id="project-notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </div>
    </div>
  );
}

export function AddProjectButton() {
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
        <Plus className="size-3.5" /> Add project
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add home project</DialogTitle>
        </DialogHeader>
        <Fields form={form} setForm={setForm} />
        <DialogFooter>
          <Button
            type="button"
            disabled={!form.title.trim() || pending}
            onClick={() => {
              startTransition(async () => {
                await createHomeProject(toInput(form));
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

export function EditProjectButton({ project }: { project: ExistingProject }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(() => projectToForm(project));
  const [pending, startTransition] = useTransition();

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) setForm(projectToForm(project));
      }}
    >
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground size-6"
            aria-label={`Edit ${project.title}`}
          />
        }
      >
        <Pencil className="size-3.5" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit home project</DialogTitle>
        </DialogHeader>
        <Fields form={form} setForm={setForm} />
        <DialogFooter className="flex-row justify-between sm:justify-between">
          <ConfirmDeleteButton
            itemLabel={project.title}
            size="sm"
            onConfirm={async () => {
              await deleteHomeProject(project.id);
              setOpen(false);
            }}
          />
          <Button
            type="button"
            disabled={!form.title.trim() || pending}
            onClick={() => {
              startTransition(async () => {
                await updateHomeProject(project.id, toInput(form));
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
