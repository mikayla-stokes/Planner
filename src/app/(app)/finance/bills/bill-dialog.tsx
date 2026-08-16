"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { createBill, updateBill, deleteBill, type BillInput } from "./actions";
import type { BillFrequency } from "@/generated/prisma/enums";
import type { getProfiles } from "./queries";

// Prisma's Decimal fields can't cross the Server -> Client Component boundary
// as-is, so the page converts amount to a string before handing this a bill.
export type SerializedBill = {
  id: string;
  name: string;
  amount: string;
  dueDay: number | null;
  frequency: BillFrequency;
  autopay: boolean;
  assigneeId: string | null;
  notes: string | null;
};

type Profiles = Awaited<ReturnType<typeof getProfiles>>;

const FREQUENCIES: BillFrequency[] = ["MONTHLY", "QUARTERLY", "YEARLY"];
const FREQUENCY_LABELS: Record<BillFrequency, string> = {
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  YEARLY: "Yearly",
};
const EITHER = "EITHER";

type FormState = {
  name: string;
  amount: string;
  dueDay: string;
  frequency: BillFrequency;
  autopay: boolean;
  assigneeId: string;
  notes: string;
};

function emptyForm(): FormState {
  return { name: "", amount: "", dueDay: "", frequency: "MONTHLY", autopay: false, assigneeId: EITHER, notes: "" };
}

function billToForm(b: SerializedBill): FormState {
  return {
    name: b.name,
    amount: b.amount,
    dueDay: b.dueDay?.toString() ?? "",
    frequency: b.frequency,
    autopay: b.autopay,
    assigneeId: b.assigneeId ?? EITHER,
    notes: b.notes ?? "",
  };
}

function toInput(form: FormState): BillInput {
  return {
    name: form.name,
    amount: form.amount ? Number(form.amount) : 0,
    dueDay: form.dueDay ? Number(form.dueDay) : null,
    frequency: form.frequency,
    autopay: form.autopay,
    assigneeId: form.assigneeId === EITHER ? null : form.assigneeId,
    notes: form.notes,
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
        <Label htmlFor="bill-name">Bill</Label>
        <Input id="bill-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label htmlFor="bill-amount">Amount</Label>
          <Input
            id="bill-amount"
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bill-due-day">Due day</Label>
          <Input
            id="bill-due-day"
            type="number"
            min={1}
            max={31}
            value={form.dueDay}
            onChange={(e) => setForm({ ...form, dueDay: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label>Frequency</Label>
          <Select value={form.frequency} onValueChange={(v) => setForm({ ...form, frequency: v as BillFrequency })}>
            <SelectTrigger className="w-full">
              <SelectValue>{(v: BillFrequency) => FREQUENCY_LABELS[v]}</SelectValue>
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
          <Select value={form.assigneeId} onValueChange={(v) => setForm({ ...form, assigneeId: v ?? EITHER })}>
            <SelectTrigger className="w-full">
              <SelectValue>
                {(v: string) => (v === EITHER ? "Either" : (profiles.find((p) => p.id === v)?.name ?? v))}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={EITHER}>Either</SelectItem>
              {profiles.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox checked={form.autopay} onCheckedChange={(v) => setForm({ ...form, autopay: v === true })} />
        Autopay
      </label>
      <div className="space-y-1.5">
        <Label htmlFor="bill-notes">Notes (optional)</Label>
        <Textarea id="bill-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </div>
    </div>
  );
}

export function AddBillButton({ profiles }: { profiles: Profiles }) {
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
        <Plus className="size-3.5" /> Add bill
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add bill</DialogTitle>
        </DialogHeader>
        <Fields form={form} setForm={setForm} profiles={profiles} />
        <DialogFooter>
          <Button
            type="button"
            disabled={!form.name.trim() || pending}
            onClick={() => {
              startTransition(async () => {
                await createBill(toInput(form));
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

export function EditBillButton({ bill, profiles }: { bill: SerializedBill; profiles: Profiles }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(() => billToForm(bill));
  const [pending, startTransition] = useTransition();

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) setForm(billToForm(bill));
      }}
    >
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground size-6"
            aria-label={`Edit ${bill.name}`}
          />
        }
      >
        <Pencil className="size-3.5" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit bill</DialogTitle>
        </DialogHeader>
        <Fields form={form} setForm={setForm} profiles={profiles} />
        <DialogFooter className="flex-row justify-between sm:justify-between">
          <ConfirmDeleteButton
            itemLabel={bill.name}
            size="sm"
            onConfirm={async () => {
              await deleteBill(bill.id);
              setOpen(false);
            }}
          />
          <Button
            type="button"
            disabled={!form.name.trim() || pending}
            onClick={() => {
              startTransition(async () => {
                await updateBill(bill.id, toInput(form));
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
