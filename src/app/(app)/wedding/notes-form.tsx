"use client";

import { useState, useTransition } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { updateWeddingNotes } from "./actions";

export function NotesForm({ weddingId, initialNotes }: { weddingId: string; initialNotes: string }) {
  const [notes, setNotes] = useState(initialNotes);
  const [saved, setSaved] = useState(initialNotes);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-2">
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Anything worth remembering — ideas, reminders, links…"
        rows={4}
      />
      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          disabled={pending || notes === saved}
          onClick={() => {
            startTransition(async () => {
              await updateWeddingNotes(weddingId, notes);
              setSaved(notes);
            });
          }}
        >
          {pending ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}
