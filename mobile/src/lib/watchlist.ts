import AsyncStorage from "@react-native-async-storage/async-storage";

export type Watched = {
  id: string;
  title: string;
  company: string;
  href: string;
};

const KEY = "jobrow:watchlist";
const MAX = 200;

export async function listWatched(): Promise<Watched[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Watched[];
    return Array.isArray(parsed) ? parsed.slice(0, MAX) : [];
  } catch {
    return [];
  }
}

export async function isWatched(id: string): Promise<boolean> {
  const items = await listWatched();
  return items.some((item) => item.id === id);
}

export async function toggleWatched(item: Watched): Promise<Watched[]> {
  const current = await listWatched();
  const next = current.some((row) => row.id === item.id)
    ? current.filter((row) => row.id !== item.id)
    : [item, ...current];
  const clipped = next.slice(0, MAX);
  await AsyncStorage.setItem(KEY, JSON.stringify(clipped));
  return clipped;
}
