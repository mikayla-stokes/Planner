"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import {
  createTimelineEvent,
  updateTimelineEvent,
  deleteTimelineEvent,
  type TimelineEventInput,
} from "./actions";
import type { TimelineEvent } from "@/generated/prisma/client";

type TimelineSubEventValue = TimelineEvent["subEvent"];

function Fields({
  form,
  setForm,
}: {
  form: TimelineEventInput;
  setForm: (f: TimelineEventInput) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="t-time">Time</Label>
        <Input
          id="t-time"
          placeholder="e.g. 4:45 pm"
          value={form.time}
          onChange={(e) => setForm({ ...form, time: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="t-desc">Description</Label>
        <Input
          id="t-desc"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="t-loc">Location (optional)</Label>
        <Input
          id="t-loc"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
      </div>
    </div>
  );
}

export function AddTimelineEventButton({ subEvent }: { subEvent: TimelineSubEventValue }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<TimelineEventInput>({ subEvent, time: "", description: "", location: "" });
  const [pending, startTransition] = useTransition();

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setForm({ subEvent, time: "", description: "", location: "" });
      }}
    >
      <DialogTrigger render={<Button type="button" variant="ghost" size="sm" className="gap-1" />}>
        <Plus className="size-3.5" /> Add event
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add timeline event</DialogTitle>
        </DialogHeader>
        <Fields form={form} setForm={setForm} />
        <DialogFooter>
          <Button
            type="button"
            disabled={!form.time.trim() || !form.description.trim() || pending}
            onClick={() => {
              startTransition(async () => {
                await createTimelineEvent(form);
                setOpen(false);
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

export function EditTimelineEventButton({ event }: { event: TimelineEvent }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<TimelineEventInput>({
    subEvent: event.subEvent,
    time: event.time,
    description: event.description,
    location: event.location ?? "",
  });
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
            aria-label={`Edit ${event.description}`}
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
            itemLabel={event.description}
            size="sm"
            onConfirm={async () => {
              await deleteTimelineEvent(event.id);
              setOpen(false);
            }}
          />
          <Button
            type="button"
            disabled={!form.time.trim() || !form.description.trim() || pending}
            onClick={() => {
              startTransition(async () => {
                await updateTimelineEvent(event.id, form);
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
