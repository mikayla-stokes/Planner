import { getLinkDocuments } from "./queries";
import { DocumentsList } from "./documents-list";
import { AddDocumentButton } from "./document-dialog";

export default async function DocumentsPage() {
  const docs = await getLinkDocuments();
  const categories = [...new Set(docs.map((d) => d.category))].sort((a, b) => a.localeCompare(b));

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Links & Documents</h1>
          <p className="text-muted-foreground text-sm">{docs.length} saved</p>
        </div>
        <AddDocumentButton existingCategories={categories} />
      </div>
      <DocumentsList docs={docs} categories={categories} />
    </div>
  );
}
