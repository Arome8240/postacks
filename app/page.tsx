"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import RequestPanel from "@/components/RequestPanel";
import {
  getCollections,
  createCollection,
  deleteCollection,
  addRequestToCollection,
  deleteRequest,
  exportCollection,
  importCollection,
} from "@/lib/collections";
import type { Collection, SavedRequest } from "@/lib/types";

export default function Home() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeRequest, setActiveRequest] = useState<SavedRequest | null>(null);

  useEffect(() => {
    setCollections(getCollections());
  }, []);

  function refresh() {
    setCollections(getCollections());
  }

  function handleCreateCollection(name: string) {
    createCollection(name);
    refresh();
  }

  function handleDeleteCollection(id: string) {
    deleteCollection(id);
    if (activeRequest) {
      const col = collections.find((c) => c.id === id);
      if (col?.requests.some((r) => r.id === activeRequest.id))
        setActiveRequest(null);
    }
    refresh();
  }

  function handleDeleteRequest(colId: string, reqId: string) {
    deleteRequest(colId, reqId);
    if (activeRequest?.id === reqId) setActiveRequest(null);
    refresh();
  }

  function handleSaveRequest(
    colId: string,
    req: Omit<SavedRequest, "id" | "createdAt">,
  ) {
    addRequestToCollection(colId, req);
    refresh();
  }

  function handleExport(col: Collection) {
    const encoded = exportCollection(col);
    navigator.clipboard.writeText(encoded).catch(() => {
      prompt("Copy this export string:", encoded);
    });
  }

  function handleImport(encoded: string) {
    try {
      importCollection(encoded);
      refresh();
    } catch {
      alert("Invalid import string.");
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar
        collections={collections}
        activeRequestId={activeRequest?.id ?? null}
        onSelectRequest={(req) => setActiveRequest(req)}
        onCreateCollection={handleCreateCollection}
        onDeleteCollection={handleDeleteCollection}
        onDeleteRequest={handleDeleteRequest}
        onImport={handleImport}
        onExport={handleExport}
      />
      <main className="flex-1 overflow-y-auto bg-[#0f1117]">
        <RequestPanel
          key={activeRequest?.id ?? "new"}
          initialRequest={activeRequest}
          collections={collections}
          onSave={handleSaveRequest}
        />
      </main>
    </div>
  );
}
