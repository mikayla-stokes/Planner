"use client";

import { useState, useTransition } from "react";
import { Dices, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScaleInput } from "./scale-input";
import { upsertTodayCheckIn } from "./actions";
import { pickRandomVerse } from "./verses";
import { CheckInCard } from "./checkin-card";

type CheckIn = {
  energy: number;
  mood: number;
  need: string | null;
  want: string | null;
  verse: string | null;
};

export function CheckInForm({
  name,
  profileId,
  existing,
}: {
  name: string;
  profileId: string;
  existing: CheckIn | null;
}) {
  const [editing, setEditing] = useState(!existing);
  const [energy, setEnergy] = useState(existing?.energy ?? 5);
  const [mood, setMood] = useState(existing?.mood ?? 5);
  const [need, setNeed] = useState(existing?.need ?? "");
  const [want, setWant] = useState(existing?.want ?? "");
  const [verse, setVerse] = useState(existing?.verse ?? "");
  const [pending, startTransition] = useTransition();

  if (!editing) {
    return (
      <div className="relative">
        <CheckInCard name={name} checkIn={existing} />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-muted-foreground absolute top-2 right-2 size-6"
          aria-label={`Edit ${name}'s check-in`}
          onClick={() => setEditing(true)}
        >
          <Pencil className="size-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <Label>Energy</Label>
          <ScaleInput value={energy} onChange={setEnergy} />
        </div>
        <div className="space-y-1.5">
          <Label>Mood</Label>
          <ScaleInput value={mood} onChange={setMood} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`need-${profileId}`}>What I need today</Label>
          <Input id={`need-${profileId}`} value={need} onChange={(e) => setNeed(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`want-${profileId}`}>What I want today</Label>
          <Input id={`want-${profileId}`} value={want} onChange={(e) => setWant(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`verse-${profileId}`}>A verse for today</Label>
          <div className="flex gap-1.5">
            <Input id={`verse-${profileId}`} value={verse} onChange={(e) => setVerse(e.target.value)} className="flex-1" />
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Suggest a verse"
              onClick={() => setVerse(pickRandomVerse())}
            >
              <Dices className="size-4" />
            </Button>
          </div>
        </div>
        <Button
          type="button"
          className="w-full"
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              await upsertTodayCheckIn({ profileId, energy, mood, need, want, verse });
              setEditing(false);
            });
          }}
        >
          Save
        </Button>
      </CardContent>
    </Card>
  );
}
