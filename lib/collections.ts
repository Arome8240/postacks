import type { Collection, SavedRequest } from "./types";

const KEY = "postacks_collections";

export function getCollections(): Collection[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveCollections(collections: Collection[]) {
  localStorage.setItem(KEY, JSON.stringify(collections));
}

export function createCollection(name: string, description = ""): Collection {
  const collections = getCollections();
  const col: Collection = {
    id: crypto.randomUUID(),
    name,
    description,
    requests: [],
    createdAt: Date.now(),
  };
  saveCollections([...collections, col]);
  return col;
}

export function deleteCollection(id: string) {
  saveCollections(getCollections().filter((c) => c.id !== id));
}

export function addRequestToCollection(
  collectionId: string,
  req: Omit<SavedRequest, "id" | "createdAt">,
) {
  const collections = getCollections();
  const saved: SavedRequest = {
    ...req,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  saveCollections(
    collections.map((c) =>
      c.id === collectionId ? { ...c, requests: [...c.requests, saved] } : c,
    ),
  );
  return saved;
}

export function deleteRequest(collectionId: string, requestId: string) {
  const collections = getCollections();
  saveCollections(
    collections.map((c) =>
      c.id === collectionId
        ? { ...c, requests: c.requests.filter((r) => r.id !== requestId) }
        : c,
    ),
  );
}

export function exportCollection(collection: Collection): string {
  return btoa(encodeURIComponent(JSON.stringify(collection)));
}

export function importCollection(encoded: string): Collection {
  const col: Collection = JSON.parse(decodeURIComponent(atob(encoded)));
  col.id = crypto.randomUUID();
  col.createdAt = Date.now();
  const collections = getCollections();
  saveCollections([...collections, col]);
  return col;
}
