const KEY = "meta_ads_recent_searches";
const MAX = 8;

export function getRecentSearches() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function addRecentSearch(term) {
  const clean = term.trim();
  if (!clean) return;
  const current = getRecentSearches().filter((t) => t !== clean);
  const next = [clean, ...current].slice(0, MAX);
  window.localStorage.setItem(KEY, JSON.stringify(next));
}
