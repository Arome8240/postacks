"use client";

import { useState } from "react";
import {
  Add,
  FolderOpen,
  Folder2,
  ExportSquare,
  Trash,
  ArrowDown2,
  ArrowRight2,
  ImportSquare,
  DocumentText,
} from "iconsax-react";
import type { Collection, SavedRequest } from "@/lib/types";

interface Props {
  collections: Collection[];
  activeRequestId: string | null;
  onSelectRequest: (req: SavedRequest, col: Collection) => void;
  onCreateCollection: (name: string) => void;
  onDeleteCollection: (id: string) => void;
  onDeleteRequest: (colId: string, reqId: string) => void;
  onImport: (encoded: string) => void;
  onExport: (col: Collection) => void;
}

export default function Sidebar({
  collections,
  activeRequestId,
  onSelectRequest,
  onCreateCollection,
  onDeleteCollection,
  onDeleteRequest,
  onImport,
  onExport,
}: Props) {
  const [newColName, setNewColName] = useState("");
  const [importStr, setImportStr] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  function toggle(id: string) {
    setExpanded((p) => ({ ...p, [id]: !p[id] }));
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newColName.trim()) return;
    onCreateCollection(newColName.trim());
    setNewColName("");
  }

  function handleImport(e: React.FormEvent) {
    e.preventDefault();
    if (!importStr.trim()) return;
    onImport(importStr.trim());
    setImportStr("");
  }

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-[#161b27] border-r border-[#1e2535]">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-[#1e2535]">
        <div className="w-7 h-7 rounded-lg bg-[#7c5cfc] flex items-center justify-center">
          <DocumentText size={14} color="#fff" variant="Bold" />
        </div>
        <span className="font-semibold text-sm tracking-wide text-white">
          Postacks
        </span>
      </div>

      {/* New collection */}
      <form onSubmit={handleCreate} className="flex gap-2 px-3 pt-4 pb-2">
        <input
          value={newColName}
          onChange={(e) => setNewColName(e.target.value)}
          placeholder="New collection…"
          className="flex-1 min-w-0 bg-[#0f1117] border border-[#1e2535] rounded-lg px-3 py-1.5 text-xs text-[#e2e8f0] placeholder-[#64748b] outline-none focus:border-[#7c5cfc] transition-colors"
        />
        <button
          type="submit"
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#7c5cfc] hover:bg-[#6b4ef0] transition-colors shrink-0"
          title="Create collection"
        >
          <Add size={14} color="#fff" />
        </button>
      </form>

      {/* Collections list */}
      <nav className="flex-1 overflow-y-auto px-2 py-1">
        {collections.length === 0 && (
          <p className="text-xs text-[#64748b] text-center mt-6 px-4">
            No collections yet.
          </p>
        )}
        {collections.map((col) => (
          <div key={col.id} className="mb-1">
            <div className="flex items-center gap-1 group rounded-lg hover:bg-[#1e2535] transition-colors">
              <button
                className="flex items-center gap-2 flex-1 min-w-0 px-2 py-2 text-left"
                onClick={() => toggle(col.id)}
              >
                {expanded[col.id] ? (
                  <ArrowDown2 size={12} color="#64748b" />
                ) : (
                  <ArrowRight2 size={12} color="#64748b" />
                )}
                {expanded[col.id] ? (
                  <FolderOpen size={14} color="#7c5cfc" variant="Bold" />
                ) : (
                  <Folder2 size={14} color="#64748b" variant="Bold" />
                )}
                <span className="text-xs text-[#e2e8f0] truncate flex-1">
                  {col.name}
                </span>
                <span className="text-[10px] text-[#64748b] bg-[#0f1117] rounded px-1.5 py-0.5 shrink-0">
                  {col.requests.length}
                </span>
              </button>
              <div className="flex items-center gap-0.5 pr-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  title="Export"
                  onClick={() => onExport(col)}
                  className="p-1 rounded hover:bg-[#7c5cfc]/20 transition-colors"
                >
                  <ExportSquare size={12} color="#64748b" />
                </button>
                <button
                  title="Delete"
                  onClick={() => onDeleteCollection(col.id)}
                  className="p-1 rounded hover:bg-[#ef4444]/20 transition-colors"
                >
                  <Trash size={12} color="#ef4444" />
                </button>
              </div>
            </div>

            {expanded[col.id] && (
              <ul className="ml-4 border-l border-[#1e2535] pl-2 mt-0.5 space-y-0.5">
                {col.requests.length === 0 && (
                  <li className="text-[11px] text-[#64748b] py-1 px-2">
                    No saved requests.
                  </li>
                )}
                {col.requests.map((req) => (
                  <li
                    key={req.id}
                    className="flex items-center gap-1 group/req"
                  >
                    <button
                      className={`flex items-center gap-2 flex-1 min-w-0 px-2 py-1.5 rounded-lg text-left transition-colors ${
                        activeRequestId === req.id
                          ? "bg-[#7c5cfc]/20 text-white"
                          : "hover:bg-[#1e2535] text-[#94a3b8]"
                      }`}
                      onClick={() => onSelectRequest(req, col)}
                    >
                      <span
                        className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded shrink-0 ${
                          req.network === "mainnet"
                            ? "bg-[#7c5cfc]/20 text-[#7c5cfc]"
                            : "bg-[#f59e0b]/20 text-[#f59e0b]"
                        }`}
                      >
                        {req.network === "mainnet" ? "M" : "T"}
                      </span>
                      <span className="text-xs truncate">{req.name}</span>
                    </button>
                    <button
                      onClick={() => onDeleteRequest(col.id, req.id)}
                      className="p-1 rounded opacity-0 group-hover/req:opacity-100 hover:bg-[#ef4444]/20 transition-all shrink-0"
                    >
                      <Trash size={11} color="#ef4444" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </nav>

      {/* Import */}
      <form
        onSubmit={handleImport}
        className="flex gap-2 px-3 py-3 border-t border-[#1e2535]"
      >
        <input
          value={importStr}
          onChange={(e) => setImportStr(e.target.value)}
          placeholder="Paste export string…"
          className="flex-1 min-w-0 bg-[#0f1117] border border-[#1e2535] rounded-lg px-3 py-1.5 text-xs text-[#e2e8f0] placeholder-[#64748b] outline-none focus:border-[#7c5cfc] transition-colors"
        />
        <button
          type="submit"
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1e2535] hover:bg-[#7c5cfc]/30 transition-colors shrink-0"
          title="Import collection"
        >
          <ImportSquare size={14} color="#7c5cfc" />
        </button>
      </form>
    </aside>
  );
}
