"use client";

import { useState, useTransition } from "react";
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
import { createBudgetItem, updateBudgetItem, deleteBudgetItem, type BudgetItemInput } from "./actions";

// Prisma's Decimal fields can't cross the Server -> Client Component boundary
// as-is, so the page converts them to plain strings before handing this a
// budget item — see SerializedBudgetItem below rather than the raw model type.
export type SerializedBudgetItem = {
  id: string;
  item: string;
  priorityLevel: string | null;
  category: string;
  estimatedCost: string | null;
  budget: string | null;
  amountPaid: string;
  notes: string | null;
};

type FormState = {
  item: string;
  priorityLevel: string;
  category: string;
  estimatedCost: string;
  budget: string;
  amountPaid: string;
  notes: string;
};

function emptyForm(): FormState {
  return { item: "", priorityLevel: "", category: "", estimatedCost: "", budget: "", amountPaid: "0", notes: "" };
}

function itemToForm(b: SerializedBudgetItem): FormState {
  return {
    item: b.item,
    priorityLevel: b.priorityLevel ?? "",
    category: b.category,
    estimatedCost: b.estimatedCost ?? "",
    budget: b.budget ?? "",
    amountPaid: b.amountPaid,
    notes: b.notes ?? "",
  };
}

function toInput(form: FormState): BudgetItemInput {
  return {
    item: form.item,
    priorityLevel: form.priorityLevel,
    category: form.category,
    estimatedCost: form.estimatedCost ? Number(form.estimatedCost) : undefined,
    budget: form.budget ? Number(form.budget) : undefined,
    amountPaid: form.amountPaid ? Number(form.amountPaid) : 0,
    notes: form.notes,
  };
}

function Fields({ form, setForm }: { form: FormState; setForm: (f: FormState) => void }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label htmlFor="b-item">Item</Label>
          <Input id="b-item" value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="b-category">Category</Label>
          <Input
            id="b-category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="b-priority">Priority</Label>
        <Input
          id="b-priority"
          value={form.priorityLevel}
          onChange={(e) => setForm({ ...form, priorityLevel: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1.5">
          <Label htmlFor="b-estimated">Estimated</Label>
          <Input
            id="b-estimated"
            type="number"
            value={form.estimatedCost}
            onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="b-budget">Budget</Label>
          <Input
            id="b-budget"
            type="number"
            value={form.budget}
            onChange={(e) => setForm({ ...form, budget: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="b-paid">Paid</Label>
          <Input
            id="b-paid"
            type="number"
            value={form.amountPaid}
            onChange={(e) => setForm({ ...form, amountPaid: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="b-notes">Notes</Label>
        <Textarea id="b-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </div>
    </div>
  );
}

export function AddBudgetItemButton() {
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
        <Plus className="size-3.5" /> Add Item
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add budget item</DialogTitle>
        </DialogHeader>
        <Fields form={form} setForm={setForm} />
        <DialogFooter>
          <Button
            type="button"
            disabled={!form.item.trim() || pending}
            onClick={() => {
              startTransition(async () => {
                await createBudgetItem(toInput(form));
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

export function EditBudgetItemButton({ item }: { item: SerializedBudgetItem }) {
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
            aria-label={`Edit ${item.item}`}
          />
        }
      >
        <Pencil className="size-3.5" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit budget item</DialogTitle>
        </DialogHeader>
        <Fields form={form} setForm={setForm} />
        <DialogFooter className="flex-row justify-between sm:justify-between">
          <ConfirmDeleteButton
            itemLabel={item.item}
            size="sm"
            onConfirm={async () => {
              await deleteBudgetItem(item.id);
              setOpen(false);
            }}
          />
          <Button
            type="button"
            disabled={!form.item.trim() || pending}
            onClick={() => {
              startTransition(async () => {
                await updateBudgetItem(item.id, toInput(form));
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
