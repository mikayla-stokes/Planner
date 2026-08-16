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
import { createPackingItem, updatePackingItem, deletePackingItem } from "./actions";

export function AddPackingItemButton({
  listId,
  defaultSubcategory,
}: {
  listId: string;
  defaultSubcategory?: string;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [subcategory, setSubcategory] = useState(defaultSubcategory ?? "");
  const [pending, startTransition] = useTransition();

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setText("");
          setSubcategory(defaultSubcategory ?? "");
        }
      }}
    >
      <DialogTrigger render={<Button type="button" variant="ghost" size="sm" className="gap-1" />}>
        <Plus className="size-3.5" /> Add item
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add packing item</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="p-text">Item</Label>
            <Input id="p-text" value={text} onChange={(e) => setText(e.target.value)} autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-sub">Group (optional)</Label>
            <Input id="p-sub" value={subcategory} onChange={(e) => setSubcategory(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            disabled={!text.trim() || pending}
            onClick={() => {
              startTransition(async () => {
                await createPackingItem({ listId, text: text.trim(), subcategory });
                setOpen(false);
                setText("");
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

export function EditPackingItemButton({
  item,
}: {
  item: { id: string; text: string; subcategory: string | null };
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(item.text);
  const [subcategory, setSubcategory] = useState(item.subcategory ?? "");
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
            aria-label={`Edit ${item.text}`}
          />
        }
      >
        <Pencil className="size-3.5" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit item</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="p-text-edit">Item</Label>
            <Input id="p-text-edit" value={text} onChange={(e) => setText(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-sub-edit">Group (optional)</Label>
            <Input id="p-sub-edit" value={subcategory} onChange={(e) => setSubcategory(e.target.value)} />
          </div>
        </div>
        <DialogFooter className="flex-row justify-between sm:justify-between">
          <ConfirmDeleteButton
            itemLabel={item.text}
            size="sm"
            onConfirm={async () => {
              await deletePackingItem(item.id);
              setOpen(false);
            }}
          />
          <Button
            type="button"
            disabled={!text.trim() || pending}
            onClick={() => {
              startTransition(async () => {
                await updatePackingItem(item.id, { text: text.trim(), subcategory });
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
