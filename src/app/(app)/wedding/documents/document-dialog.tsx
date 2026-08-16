"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { createLinkDocument, updateLinkDocument, deleteLinkDocument } from "./actions";
import type { getLinkDocuments } from "./queries";

type ExistingDoc = Awaited<ReturnType<typeof getLinkDocuments>>[number];

type FormState = { title: string; url: string; category: string; notes: string };

function emptyForm(defaultCategory?: string): FormState {
  return { title: "", url: "", category: defaultCategory ?? "", notes: "" };
}

function docToForm(d: ExistingDoc): FormState {
  return { title: d.title, url: d.url ?? "", category: d.category, notes: d.notes ?? "" };
}

function Fields({
  form,
  setForm,
  existingCategories,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
  existingCategories: string[];
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="doc-title">Title</Label>
        <Input id="doc-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="doc-url">Link (optional)</Label>
        <Input
          id="doc-url"
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
          placeholder="https://…"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="doc-category">Category</Label>
        <Input
          id="doc-category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          placeholder="e.g. Insurance, Warranties, Contracts"
        />
        {existingCategories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {existingCategories.map((c) => (
              <button type="button" key={c} onClick={() => setForm({ ...form, category: c })} className="cursor-pointer">
                <Badge variant="outline">{c}</Badge>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="doc-notes">Notes (optional)</Label>
        <Textarea id="doc-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </div>
    </div>
  );
}

export function AddDocumentButton({ existingCategories }: { existingCategories: string[] }) {
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
        <Plus className="size-3.5" /> Add
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add link or document</DialogTitle>
        </DialogHeader>
        <Fields form={form} setForm={setForm} existingCategories={existingCategories} />
        <DialogFooter>
          <Button
            type="button"
            disabled={!form.title.trim() || !form.category.trim() || pending}
            onClick={() => {
              startTransition(async () => {
                await createLinkDocument(form);
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

export function EditDocumentButton({
  doc,
  existingCategories,
}: {
  doc: ExistingDoc;
  existingCategories: string[];
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(() => docToForm(doc));
  const [pending, startTransition] = useTransition();

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) setForm(docToForm(doc));
      }}
    >
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground size-6"
            aria-label={`Edit ${doc.title}`}
          />
        }
      >
        <Pencil className="size-3.5" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit link or document</DialogTitle>
        </DialogHeader>
        <Fields form={form} setForm={setForm} existingCategories={existingCategories} />
        <DialogFooter className="flex-row justify-between sm:justify-between">
          <ConfirmDeleteButton
            itemLabel={doc.title}
            size="sm"
            onConfirm={async () => {
              await deleteLinkDocument(doc.id);
              setOpen(false);
            }}
          />
          <Button
            type="button"
            disabled={!form.title.trim() || !form.category.trim() || pending}
            onClick={() => {
              startTransition(async () => {
                await updateLinkDocument(doc.id, form);
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
