export function missingSourceIds(previouslyOpen: string[], seen: string[]): string[] {
  const set = new Set(seen);
  return previouslyOpen.filter((id) => !set.has(id));
}
