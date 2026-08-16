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
import { createGoal, updateGoal, deleteGoal, type GoalInput } from "./goal-actions";
import type { GoalPeriod } from "@/generated/prisma/enums";
import type { getGoals, getProfiles } from "./queries";

type ExistingGoal = Awaited<ReturnType<typeof getGoals>>[number];
type Profiles = Awaited<ReturnType<typeof getProfiles>>;

const PERIODS: GoalPeriod[] = ["YEARLY", "QUARTERLY"];
const PERIOD_LABELS: Record<GoalPeriod, string> = { YEARLY: "Yearly", QUARTERLY: "Quarterly" };
const QUARTERS = [1, 2, 3, 4];
const SHARED = "SHARED";

type FormState = {
  title: string;
  notes: string;
  period: GoalPeriod;
  year: string;
  quarter: string;
  progress: string;
  profileId: string;
};

function emptyForm(): FormState {
  return {
    title: "",
    notes: "",
    period: "YEARLY",
    year: new Date().getFullYear().toString(),
    quarter: "1",
    progress: "0",
    profileId: SHARED,
  };
}

function goalToForm(g: ExistingGoal): FormState {
  return {
    title: g.title,
    notes: g.notes ?? "",
    period: g.period,
    year: g.year.toString(),
    quarter: (g.quarter ?? 1).toString(),
    progress: g.progress.toString(),
    profileId: g.profileId ?? SHARED,
  };
}

function toInput(form: FormState): GoalInput {
  return {
    title: form.title,
    notes: form.notes,
    period: form.period,
    year: Number(form.year) || new Date().getFullYear(),
    quarter: form.period === "QUARTERLY" ? Number(form.quarter) : null,
    progress: Number(form.progress) || 0,
    profileId: form.profileId === SHARED ? null : form.profileId,
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
        <Label htmlFor="goal-title">Goal</Label>
        <Input id="goal-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label>Period</Label>
          <Select value={form.period} onValueChange={(v) => setForm({ ...form, period: v as GoalPeriod })}>
            <SelectTrigger className="w-full">
              <SelectValue>{(v: GoalPeriod) => PERIOD_LABELS[v]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {PERIODS.map((p) => (
                <SelectItem key={p} value={p}>
                  {PERIOD_LABELS[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="goal-year">Year</Label>
          <Input
            id="goal-year"
            type="number"
            value={form.year}
            onChange={(e) => setForm({ ...form, year: e.target.value })}
          />
        </div>
      </div>
      {form.period === "QUARTERLY" && (
        <div className="space-y-1.5">
          <Label>Quarter</Label>
          <Select value={form.quarter} onValueChange={(v) => setForm({ ...form, quarter: v ?? "1" })}>
            <SelectTrigger className="w-full">
              <SelectValue>{(v: string) => `Q${v}`}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {QUARTERS.map((q) => (
                <SelectItem key={q} value={q.toString()}>
                  Q{q}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="space-y-1.5">
        <Label>Whose goal</Label>
        <Select value={form.profileId} onValueChange={(v) => setForm({ ...form, profileId: v ?? SHARED })}>
          <SelectTrigger className="w-full">
            <SelectValue>
              {(v: string) => (v === SHARED ? "Shared" : (profiles.find((p) => p.id === v)?.name ?? v))}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={SHARED}>Shared</SelectItem>
            {profiles.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="goal-progress">Progress (%)</Label>
        <Input
          id="goal-progress"
          type="number"
          min={0}
          max={100}
          value={form.progress}
          onChange={(e) => setForm({ ...form, progress: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="goal-notes">Notes (optional)</Label>
        <Textarea id="goal-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </div>
    </div>
  );
}

export function AddGoalButton({ profiles }: { profiles: Profiles }) {
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
        <Plus className="size-3.5" /> Add goal
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add goal</DialogTitle>
        </DialogHeader>
        <Fields form={form} setForm={setForm} profiles={profiles} />
        <DialogFooter>
          <Button
            type="button"
            disabled={!form.title.trim() || pending}
            onClick={() => {
              startTransition(async () => {
                await createGoal(toInput(form));
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

export function EditGoalButton({ goal, profiles }: { goal: ExistingGoal; profiles: Profiles }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(() => goalToForm(goal));
  const [pending, startTransition] = useTransition();

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) setForm(goalToForm(goal));
      }}
    >
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground size-6"
            aria-label={`Edit ${goal.title}`}
          />
        }
      >
        <Pencil className="size-3.5" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit goal</DialogTitle>
        </DialogHeader>
        <Fields form={form} setForm={setForm} profiles={profiles} />
        <DialogFooter className="flex-row justify-between sm:justify-between">
          <ConfirmDeleteButton
            itemLabel={goal.title}
            size="sm"
            onConfirm={async () => {
              await deleteGoal(goal.id);
              setOpen(false);
            }}
          />
          <Button
            type="button"
            disabled={!form.title.trim() || pending}
            onClick={() => {
              startTransition(async () => {
                await updateGoal(goal.id, toInput(form));
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
