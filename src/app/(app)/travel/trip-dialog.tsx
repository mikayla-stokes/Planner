"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { createTrip, updateTrip, deleteTrip } from "./actions";
import type { getTrips } from "./queries";

type ExistingTrip = Awaited<ReturnType<typeof getTrips>>[number];

type FormState = { name: string; destination: string; startDate: string; endDate: string; notes: string };

function emptyForm(): FormState {
  return { name: "", destination: "", startDate: "", endDate: "", notes: "" };
}

function tripToForm(t: ExistingTrip): FormState {
  return {
    name: t.name,
    destination: t.destination ?? "",
    startDate: t.startDate ? t.startDate.toISOString().slice(0, 10) : "",
    endDate: t.endDate ? t.endDate.toISOString().slice(0, 10) : "",
    notes: t.notes ?? "",
  };
}

function Fields({ form, setForm }: { form: FormState; setForm: (f: FormState) => void }) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="trip-name">Trip name</Label>
        <Input id="trip-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="trip-destination">Destination (optional)</Label>
        <Input
          id="trip-destination"
          value={form.destination}
          onChange={(e) => setForm({ ...form, destination: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label htmlFor="trip-start">Start date</Label>
          <Input
            id="trip-start"
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="trip-end">End date</Label>
          <Input
            id="trip-end"
            type="date"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="trip-notes">Notes (optional)</Label>
        <Textarea id="trip-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </div>
    </div>
  );
}

export function AddTripButton() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setForm(emptyForm());
      }}
    >
      <DialogTrigger render={<Button type="button" size="sm" className="gap-1" />}>
        <Plus className="size-3.5" /> Add trip
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add trip</DialogTitle>
        </DialogHeader>
        <Fields form={form} setForm={setForm} />
        <DialogFooter>
          <Button
            type="button"
            disabled={!form.name.trim() || pending}
            onClick={() => {
              startTransition(async () => {
                const id = await createTrip(form);
                setOpen(false);
                router.push(`/travel/${id}`);
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

export function EditTripButton({ trip }: { trip: ExistingTrip }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(() => tripToForm(trip));
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) setForm(tripToForm(trip));
      }}
    >
      <DialogTrigger
        render={<Button type="button" variant="outline" size="sm" className="gap-1" />}
      >
        <Pencil className="size-3.5" /> Edit
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit trip</DialogTitle>
        </DialogHeader>
        <Fields form={form} setForm={setForm} />
        <DialogFooter className="flex-row justify-between sm:justify-between">
          <ConfirmDeleteButton
            itemLabel={trip.name}
            size="sm"
            onConfirm={async () => {
              await deleteTrip(trip.id);
              setOpen(false);
              router.push("/travel");
            }}
          />
          <Button
            type="button"
            disabled={!form.name.trim() || pending}
            onClick={() => {
              startTransition(async () => {
                await updateTrip(trip.id, form);
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
