"use client";

import { useState } from "react";
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
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-logo">📬 Postacks</span>
      </div>

      <form onSubmit={handleCreate} className="new-col-form">
        <input
          value={newColName}
          onChange={(e) => setNewColName(e.target.value)}
          placeholder="New collection…"
          className="input"
        />
        <button type="submit" className="btn btn-primary btn-sm">
          +
        </button>
      </form>

      <nav className="collections-list">
        {collections.length === 0 && (
          <p className="empty-hint">No collections yet.</p>
        )}
        {collections.map((col) => (
          <div key={col.id} className="collection">
            <div className="collection-header">
              <button
                className="collection-toggle"
                onClick={() => toggle(col.id)}
              >
                <span className="chevron">{expanded[col.id] ? "▾" : "▸"}</span>
                <span className="collection-name">{col.name}</span>
                <span className="req-count">{col.requests.length}</span>
              </button>
              <div className="collection-actions">
                <button
                  title="Export"
                  className="icon-btn"
                  onClick={() => onExport(col)}
                >
                  ↑
                </button>
                <button
                  title="Delete"
                  className="icon-btn danger"
                  onClick={() => onDeleteCollection(col.id)}
                >
                  ✕
                </button>
              </div>
            </div>

            {expanded[col.id] && (
              <ul className="request-list">
                {col.requests.length === 0 && (
                  <li className="empty-hint">No saved requests.</li>
                )}
                {col.requests.map((req) => (
                  <li
                    key={req.id}
                    className={`request-item ${activeRequestId === req.id ? "active" : ""}`}
                  >
                    <button
                      className="request-btn"
                      onClick={() => onSelectRequest(req, col)}
                    >
                      <span className={`badge badge-${req.network}`}>
                        {req.network}
                      </span>
                      <span className="request-name">{req.name}</span>
                    </button>
                    <button
                      className="icon-btn danger"
                      onClick={() => onDeleteRequest(col.id, req.id)}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </nav>

      <form onSubmit={handleImport} className="import-form">
        <input
          value={importStr}
          onChange={(e) => setImportStr(e.target.value)}
          placeholder="Paste export string…"
          className="input"
        />
        <button type="submit" className="btn btn-secondary btn-sm">
          Import
        </button>
      </form>
    </aside>
  );
}
