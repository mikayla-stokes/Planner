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
import { createPantryItem, updatePantryItem, deletePantryItem } from "./actions";
import type { getPantryItems } from "./queries";

type ExistingItem = Awaited<ReturnType<typeof getPantryItems>>[number];

type FormState = { name: string; quantity: string; notes: string };

function emptyForm(): FormState {
  return { name: "", quantity: "", notes: "" };
}

function itemToForm(i: ExistingItem): FormState {
  return { name: i.name, quantity: i.quantity ?? "", notes: i.notes ?? "" };
}

function Fields({ form, setForm }: { form: FormState; setForm: (f: FormState) => void }) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="pantry-name">Item</Label>
        <Input id="pantry-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pantry-qty">Quantity (optional)</Label>
        <Input
          id="pantry-qty"
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pantry-notes">Notes (optional)</Label>
        <Textarea id="pantry-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </div>
    </div>
  );
}

export function AddPantryItemButton() {
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
        <Plus className="size-3.5" /> Add item
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add pantry item</DialogTitle>
        </DialogHeader>
        <Fields form={form} setForm={setForm} />
        <DialogFooter>
          <Button
            type="button"
            disabled={!form.name.trim() || pending}
            onClick={() => {
              startTransition(async () => {
                await createPantryItem(form);
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

export function EditPantryItemButton({ item }: { item: ExistingItem }) {
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
            aria-label={`Edit ${item.name}`}
          />
        }
      >
        <Pencil className="size-3.5" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit pantry item</DialogTitle>
        </DialogHeader>
        <Fields form={form} setForm={setForm} />
        <DialogFooter className="flex-row justify-between sm:justify-between">
          <ConfirmDeleteButton
            itemLabel={item.name}
            size="sm"
            onConfirm={async () => {
              await deletePantryItem(item.id);
              setOpen(false);
            }}
          />
          <Button
            type="button"
            disabled={!form.name.trim() || pending}
            onClick={() => {
              startTransition(async () => {
                await updatePantryItem(item.id, form);
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
