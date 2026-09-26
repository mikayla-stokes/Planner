import { getLinkDocuments } from "./queries";
import { DocumentsList } from "./documents-list";
import { AddDocumentButton } from "./document-dialog";
import { ExportButton } from "@/components/export-button";

export default async function DocumentsPage() {
  const docs = await getLinkDocuments();
  const categories = [...new Set(docs.map((d) => d.category))].sort((a, b) => a.localeCompare(b));

  const exportSheets = [
    {
      name: "Links & Documents",
      rows: docs.map((d) => ({ Title: d.title, Category: d.category, URL: d.url, Notes: d.notes, Added: d.createdAt })),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Links & Documents</h1>
          <p className="text-muted-foreground text-sm">{docs.length} saved</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ExportButton filename="wedding-documents" sheets={exportSheets} />
          <AddDocumentButton existingCategories={categories} />
        </div>
      </div>
      <DocumentsList docs={docs} categories={categories} />
    </div>
  );
}
