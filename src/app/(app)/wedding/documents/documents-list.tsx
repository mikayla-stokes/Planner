"use client";

import { useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EditDocumentButton } from "./document-dialog";
import type { getLinkDocuments } from "./queries";

type Docs = Awaited<ReturnType<typeof getLinkDocuments>>;

export function DocumentsList({ docs, categories }: { docs: Docs; categories: string[] }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return docs
      .filter((d) => !activeCategory || d.category === activeCategory)
      .filter((d) => !q || d.title.toLowerCase().includes(q) || (d.notes ?? "").toLowerCase().includes(q));
  }, [docs, query, activeCategory]);

  const grouped = useMemo(() => {
    const map = new Map<string, Docs>();
    for (const d of filtered) {
      if (!map.has(d.category)) map.set(d.category, []);
      map.get(d.category)!.push(d);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <div className="space-y-3">
      <Input placeholder="Search links & documents…" value={query} onChange={(e) => setQuery(e.target.value)} />
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          <button type="button" onClick={() => setActiveCategory(null)} className="cursor-pointer">
            <Badge variant={activeCategory === null ? "default" : "outline"}>All</Badge>
          </button>
          {categories.map((c) => (
            <button type="button" key={c} onClick={() => setActiveCategory(c)} className="cursor-pointer">
              <Badge variant={activeCategory === c ? "default" : "outline"}>{c}</Badge>
            </button>
          ))}
        </div>
      )}

      {grouped.map(([category, items]) => (
        <Card key={category}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{category}</CardTitle>
          </CardHeader>
          <CardContent className="divide-y py-0">
            {items.map((doc) => (
              <div key={doc.id} className="flex items-start justify-between gap-2 py-2.5">
                <div className="min-w-0">
                  {doc.url ? (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-primary inline-flex items-center gap-1 text-sm font-medium"
                    >
                      {doc.title}
                      <ExternalLink className="size-3" />
                    </a>
                  ) : (
                    <span className="text-sm font-medium">{doc.title}</span>
                  )}
                  {doc.notes && <p className="text-muted-foreground text-xs">{doc.notes}</p>}
                </div>
                <EditDocumentButton doc={doc} existingCategories={categories} />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
      {grouped.length === 0 && (
        <p className="text-muted-foreground py-8 text-center text-sm">Nothing here yet.</p>
      )}
    </div>
  );
}
