"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
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
import { createTask } from "./todo/actions";

// Deliberately minimal — just a title (and optional due date) so adding
// something doesn't require leaving whatever you're looking at. Anything more
// specific (priority, owner, notes) can be filled in later from the To-Do page.
export function QuickAddTask() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [pending, startTransition] = useTransition();

  function reset() {
    setTitle("");
    setDueDate("");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger render={<Button type="button" size="sm" className="gap-1" />}>
        <Plus className="size-3.5" /> Quick add
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Quick add a task</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="quick-title">What needs doing?</Label>
            <Input id="quick-title" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="quick-due">Due date (optional)</Label>
            <Input id="quick-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            disabled={!title.trim() || pending}
            onClick={() => {
              startTransition(async () => {
                await createTask({ title: title.trim(), dueDate: dueDate || undefined });
                setOpen(false);
                reset();
              });
            }}
          >
            Add to To-Do
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
