"use client";

import { useActingAs, type ActingAs } from "@/lib/acting-as";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const OPTIONS: ActingAs[] = ["Mikayla", "Caleb"];

export function ProfileSwitcher() {
  const { actingAs, setActingAs } = useActingAs();

  return (
    <Select value={actingAs} onValueChange={(value) => setActingAs(value as ActingAs)}>
      <SelectTrigger size="sm" className="w-[110px]" aria-label="Who's entering this?">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
