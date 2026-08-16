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
import { createCategory, updateCategory, deleteCategory, type CategoryInput } from "./actions";

// Prisma's Decimal fields can't cross the Server -> Client Component boundary
// as-is, so the page converts monthlyBudget to a string before handing this a
// category — see SerializedCategory below rather than the raw model type.
export type SerializedCategory = {
  id: string;
  name: string;
  monthlyBudget: string;
  notes: string | null;
};

type FormState = { name: string; monthlyBudget: string; notes: string };

function emptyForm(): FormState {
  return { name: "", monthlyBudget: "", notes: "" };
}

function categoryToForm(c: SerializedCategory): FormState {
  return { name: c.name, monthlyBudget: c.monthlyBudget, notes: c.notes ?? "" };
}

function toInput(form: FormState): CategoryInput {
  return {
    name: form.name,
    monthlyBudget: form.monthlyBudget ? Number(form.monthlyBudget) : 0,
    notes: form.notes,
  };
}

function Fields({ form, setForm }: { form: FormState; setForm: (f: FormState) => void }) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="cat-name">Category</Label>
        <Input
          id="cat-name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          autoFocus
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cat-budget">Monthly budget</Label>
        <Input
          id="cat-budget"
          type="number"
          value={form.monthlyBudget}
          onChange={(e) => setForm({ ...form, monthlyBudget: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cat-notes">Notes (optional)</Label>
        <Textarea id="cat-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </div>
    </div>
  );
}

export function AddCategoryButton() {
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
        <Plus className="size-3.5" /> Add category
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add category</DialogTitle>
        </DialogHeader>
        <Fields form={form} setForm={setForm} />
        <DialogFooter>
          <Button
            type="button"
            disabled={!form.name.trim() || pending}
            onClick={() => {
              startTransition(async () => {
                await createCategory(toInput(form));
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

export function EditCategoryButton({ category }: { category: SerializedCategory }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(() => categoryToForm(category));
  const [pending, startTransition] = useTransition();

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) setForm(categoryToForm(category));
      }}
    >
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground size-6"
            aria-label={`Edit ${category.name}`}
          />
        }
      >
        <Pencil className="size-3.5" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit category</DialogTitle>
        </DialogHeader>
        <Fields form={form} setForm={setForm} />
        <DialogFooter className="flex-row justify-between sm:justify-between">
          <ConfirmDeleteButton
            itemLabel={category.name}
            size="sm"
            onConfirm={async () => {
              await deleteCategory(category.id);
              setOpen(false);
            }}
          />
          <Button
            type="button"
            disabled={!form.name.trim() || pending}
            onClick={() => {
              startTransition(async () => {
                await updateCategory(category.id, toInput(form));
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
