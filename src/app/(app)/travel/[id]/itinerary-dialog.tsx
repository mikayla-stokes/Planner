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
import { createItineraryItem, updateItineraryItem, deleteItineraryItem } from "./itinerary-actions";

type ExistingItem = {
  id: string;
  date: Date | null;
  time: string | null;
  description: string;
  location: string | null;
};

type FormState = { date: string; time: string; description: string; location: string };

function emptyForm(): FormState {
  return { date: "", time: "", description: "", location: "" };
}

function itemToForm(i: ExistingItem): FormState {
  return {
    date: i.date ? i.date.toISOString().slice(0, 10) : "",
    time: i.time ?? "",
    description: i.description,
    location: i.location ?? "",
  };
}

function Fields({ form, setForm }: { form: FormState; setForm: (f: FormState) => void }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label htmlFor="it-date">Date (optional)</Label>
          <Input id="it-date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="it-time">Time (optional)</Label>
          <Input
            id="it-time"
            placeholder="e.g. 9:00 am"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="it-desc">What&apos;s happening</Label>
        <Input
          id="it-desc"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          autoFocus
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="it-loc">Location (optional)</Label>
        <Input id="it-loc" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
      </div>
    </div>
  );
}

export function AddItineraryItemButton({ tripId }: { tripId: string }) {
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
      <DialogTrigger render={<Button type="button" variant="ghost" size="sm" className="gap-1" />}>
        <Plus className="size-3.5" /> Add to itinerary
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add itinerary item</DialogTitle>
        </DialogHeader>
        <Fields form={form} setForm={setForm} />
        <DialogFooter>
          <Button
            type="button"
            disabled={!form.description.trim() || pending}
            onClick={() => {
              startTransition(async () => {
                await createItineraryItem(tripId, form);
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

export function EditItineraryItemButton({ item, tripId }: { item: ExistingItem; tripId: string }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(() => itemToForm(item));
  const [pending, startTransition] = useTransition();

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) setForm(itemToForm(item));
      }}
    >
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground size-6"
            aria-label={`Edit ${item.description}`}
          />
        }
      >
        <Pencil className="size-3.5" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit itinerary item</DialogTitle>
        </DialogHeader>
        <Fields form={form} setForm={setForm} />
        <DialogFooter className="flex-row justify-between sm:justify-between">
          <ConfirmDeleteButton
            itemLabel={item.description}
            size="sm"
            onConfirm={async () => {
              await deleteItineraryItem(item.id, tripId);
              setOpen(false);
            }}
          />
          <Button
            type="button"
            disabled={!form.description.trim() || pending}
            onClick={() => {
              startTransition(async () => {
                await updateItineraryItem(item.id, tripId, form);
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
