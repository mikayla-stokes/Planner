"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { createExpense } from "./actions";
import type { getCategories, getProfiles } from "./queries";

type Categories = Awaited<ReturnType<typeof getCategories>>;
type Profiles = Awaited<ReturnType<typeof getProfiles>>;

const UNCATEGORIZED = "UNCATEGORIZED";
const EITHER = "EITHER";

function todayParam(): string {
  return new Date().toISOString().slice(0, 10);
}

function emptyForm() {
  return { date: todayParam(), amount: "", categoryId: UNCATEGORIZED, description: "", paidById: EITHER };
}

export function AddExpenseButton({ categories, profiles }: { categories: Categories; profiles: Profiles }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());
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
        <Plus className="size-3.5" /> Add expense
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add expense</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="exp-date">Date</Label>
              <Input
                id="exp-date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="exp-amount">Amount</Label>
              <Input
                id="exp-amount"
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                autoFocus
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="exp-description">Description (optional)</Label>
            <Input
              id="exp-description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v ?? UNCATEGORIZED })}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(v: string) => (v === UNCATEGORIZED ? "Uncategorized" : (categories.find((c) => c.id === v)?.name ?? v))}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNCATEGORIZED}>Uncategorized</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Paid by</Label>
              <Select value={form.paidById} onValueChange={(v) => setForm({ ...form, paidById: v ?? EITHER })}>
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
        </div>
        <DialogFooter>
          <Button
            type="button"
            disabled={!form.amount || pending}
            onClick={() => {
              startTransition(async () => {
                await createExpense({
                  date: form.date,
                  amount: Number(form.amount),
                  categoryId: form.categoryId === UNCATEGORIZED ? null : form.categoryId,
                  description: form.description,
                  paidById: form.paidById === EITHER ? null : form.paidById,
                });
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
