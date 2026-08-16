"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createTag } from "@/lib/tag-actions";

type Tag = { id: string; name: string; color: string };

export function TagPicker({
  allTags,
  selectedIds,
  onChange,
}: {
  allTags: Tag[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const [tags, setTags] = useState<Tag[]>(allTags);
  const [newTagName, setNewTagName] = useState("");
  const [pending, startTransition] = useTransition();

  function toggle(id: string) {
    onChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);
  }

  function addNewTag() {
    const name = newTagName.trim();
    if (!name) return;
    startTransition(async () => {
      const tag = await createTag(name);
      setTags((prev) => (prev.some((t) => t.id === tag.id) ? prev : [...prev, tag]));
      onChange(selectedIds.includes(tag.id) ? selectedIds : [...selectedIds, tag.id]);
      setNewTagName("");
    });
  }

  return (
    <div className="space-y-2">
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => {
            const selected = selectedIds.includes(tag.id);
            return (
              <button type="button" key={tag.id} onClick={() => toggle(tag.id)} className="cursor-pointer">
                <Badge
                  variant={selected ? "default" : "outline"}
                  style={selected ? { backgroundColor: tag.color, color: "#fff", borderColor: tag.color } : undefined}
                >
                  {tag.name}
                </Badge>
              </button>
            );
          })}
        </div>
      )}
      <div className="flex gap-1.5">
        <Input
          placeholder="New tag…"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addNewTag();
            }
          }}
          className="h-8 text-xs"
        />
        <Button type="button" size="sm" variant="outline" disabled={!newTagName.trim() || pending} onClick={addNewTag}>
          <Plus className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
