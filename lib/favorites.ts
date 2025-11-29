// User-scoped favorites with a singleton store + hook

let currentUserId: string | null = (() => {
  try {
    const raw = localStorage.getItem("user");
    if (raw) return JSON.parse(raw).id as string;
  } catch {}
  return null;
})();

// Key helpers
function key(userId: string | null) {
  return userId ? `favorites:${userId}` : "favorites:guest";
}
function read(userId: string | null): string[] {
  try {
    const data = localStorage.getItem(key(userId));
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}
function write(userId: string | null, ids: string[]) {
  try {
    localStorage.setItem(key(userId), JSON.stringify(ids));
  } catch {}
}

// Singleton state
let ids: string[] = read(currentUserId);
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

// Migrate guest -> user on first login
function migrateGuestToUser(newUserId: string) {
  const guest = read(null);
  if (!guest.length) return;
  const merged = new Set(read(newUserId));
  guest.forEach((id) => merged.add(id));
  write(newUserId, Array.from(merged));
  localStorage.removeItem(key(null));
}

function setUser(id: string | null) {
  if (id && !currentUserId) migrateGuestToUser(id);
  currentUserId = id;
  ids = read(currentUserId);
  notify();
}

// Public API
export function getFavorites(): string[] {
  return [...ids];
}
export function isFavorite(id: string): boolean {
  return ids.includes(id);
}
export function toggleFavorite(id: string): { list: string[]; added: boolean } {
  const i = ids.indexOf(id);
  let added = false;
  if (i >= 0) {
    ids = [...ids.slice(0, i), ...ids.slice(i + 1)];
  } else {
    ids = [id, ...ids];
    added = true;
  }
  write(currentUserId, ids);
  notify();
  return { list: [...ids], added };
}

// Reactive hook
import * as React from "react";

export function useFavorites() {
  const [state, setState] = React.useState<string[]>(ids);
  const [userId, setUserId] = React.useState<string | null>(currentUserId);

  React.useEffect(() => {
    const rerender = () => {
      setState([...ids]);
      setUserId(currentUserId);
    };
    listeners.add(rerender);
    return () => {
      listeners.delete(rerender);
    };
  }, []);

  // React to auth changes broadcast by AuthContext
  React.useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<string | null>;
      setUser(ce.detail || null);
    };
    window.addEventListener("auth:user-changed", handler);
    return () => window.removeEventListener("auth:user-changed", handler);
  }, []);

  // Sync across tabs for same user
  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!userId) {
        if (e.key === key(null)) setState(read(null));
      } else if (e.key === key(userId)) {
        setState(read(userId));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [userId]);

  return {
    ids: state,
    userId,
    isFavorite: (id: string) => state.includes(id),
    toggle: (id: string) => toggleFavorite(id),
  };
}
