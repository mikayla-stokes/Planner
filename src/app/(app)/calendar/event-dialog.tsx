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
import { createEvent, updateEvent, deleteEvent, type EventInput } from "./actions";
import { toDateParam } from "./date-utils";
import type { CalendarCategory } from "@/generated/prisma/enums";
import type { getEvents } from "./queries";

type ExistingEvent = Awaited<ReturnType<typeof getEvents>>[number];

const CATEGORIES: CalendarCategory[] = ["PERSONAL", "FAMILY", "WORK", "WEDDING", "CALEB_ONLY"];
export const CATEGORY_LABELS: Record<CalendarCategory, string> = {
  PERSONAL: "Personal",
  FAMILY: "Family",
  WORK: "Work",
  WEDDING: "Wedding",
  CALEB_ONLY: "Caleb only",
};

type FormState = {
  title: string;
  date: string;
  time: string;
  category: CalendarCategory;
  location: string;
  notes: string;
};

function emptyForm(): FormState {
  return { title: "", date: toDateParam(new Date()), time: "", category: "PERSONAL", location: "", notes: "" };
}

function eventToForm(e: ExistingEvent): FormState {
  return {
    title: e.title,
    date: toDateParam(e.date),
    time: e.time ?? "",
    category: e.category,
    location: e.location ?? "",
    notes: e.notes ?? "",
  };
}

function toInput(form: FormState): EventInput {
  return {
    title: form.title,
    date: form.date,
    time: form.time,
    category: form.category,
    location: form.location,
    notes: form.notes,
  };
}

function Fields({ form, setForm }: { form: FormState; setForm: (f: FormState) => void }) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="event-title">Title</Label>
        <Input
          id="event-title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          autoFocus
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label htmlFor="event-date">Date</Label>
          <Input
            id="event-date"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="event-time">Time (optional)</Label>
          <Input
            id="event-time"
            placeholder="3:00 PM"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Category</Label>
        <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as CalendarCategory })}>
          <SelectTrigger className="w-full">
            <SelectValue>{(v: CalendarCategory) => CATEGORY_LABELS[v]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="event-location">Location (optional)</Label>
        <Input
          id="event-location"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="event-notes">Notes (optional)</Label>
        <Textarea id="event-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </div>
    </div>
  );
}

export function AddEventButton() {
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
        <Plus className="size-3.5" /> Add event
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add event</DialogTitle>
        </DialogHeader>
        <Fields form={form} setForm={setForm} />
        <DialogFooter>
          <Button
            type="button"
            disabled={!form.title.trim() || pending}
            onClick={() => {
              startTransition(async () => {
                await createEvent(toInput(form));
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

export function EditEventButton({ event }: { event: ExistingEvent }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(() => eventToForm(event));
  const [pending, startTransition] = useTransition();

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) setForm(eventToForm(event));
      }}
    >
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground size-6"
            aria-label={`Edit ${event.title}`}
          />
        }
      >
        <Pencil className="size-3.5" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit event</DialogTitle>
        </DialogHeader>
        <Fields form={form} setForm={setForm} />
        <DialogFooter className="flex-row justify-between sm:justify-between">
          <ConfirmDeleteButton
            itemLabel={event.title}
            size="sm"
            onConfirm={async () => {
              await deleteEvent(event.id);
              setOpen(false);
            }}
          />
          <Button
            type="button"
            disabled={!form.title.trim() || pending}
            onClick={() => {
              startTransition(async () => {
                await updateEvent(event.id, toInput(form));
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
