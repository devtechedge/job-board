export type Watched = {
  id: string;
  title: string;
  company: string;
  href: string;
};

const KEY = "jobrow:watchlist";

function read(): Watched[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Watched[];
    return Array.isArray(parsed) ? parsed.slice(0, 200) : [];
  } catch {
    return [];
  }
}

function write(items: Watched[]) {
  window.localStorage.setItem(KEY, JSON.stringify(items.slice(0, 200)));
  window.dispatchEvent(new Event("jobrow:watchlist"));
}

export function listWatched(): Watched[] {
  return read();
}

export function isWatched(id: string): boolean {
  return read().some((item) => item.id === id);
}

export function toggleWatched(item: Watched): Watched[] {
  const current = read();
  const next = current.some((row) => row.id === item.id)
    ? current.filter((row) => row.id !== item.id)
    : [item, ...current];
  write(next);
  return next;
}
