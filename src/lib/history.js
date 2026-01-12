// Unified history utility (Amazon-like)
// Structure per item: { type: 'search'|'product'|'category', key: string, category?: string, timestamp: number }
// Stored in localStorage under HISTORY_KEY. Most-recent-first. De-dup by (type,key). Limit to 100.

const HISTORY_KEY = "unifiedHistoryV1";
const PREFS_KEY = "unifiedHistoryPrefsV1"; // { pauseProductUntil?: number, disableSearch?: boolean }
const LIMIT = 100;

function safeParse(json, fallback) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

export function getHistory() {
  try {
    const arr = safeParse(localStorage.getItem(HISTORY_KEY) || "[]", []);
    if (!Array.isArray(arr)) return [];
    return arr
      .filter(
        (x) =>
          x &&
          (x.type === "search" ||
            x.type === "product" ||
            x.type === "category") &&
          typeof x.key === "string" &&
          Number.isFinite(Number(x.timestamp))
      )
      .sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
  } catch {
    return [];
  }
}

// ---- Preferences helpers ----
function getPrefsInternal() {
  try {
    const obj = safeParse(localStorage.getItem(PREFS_KEY) || "{}", {});
    return typeof obj === "object" && obj ? obj : {};
  } catch {
    return {};
  }
}

function setPrefsInternal(next) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(next || {}));
    try {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("pcu-history-updated"));
      }
    } catch {}
  } catch {}
}

export function getHistoryPrefs() {
  return getPrefsInternal();
}

export function setHistoryPrefs(patch) {
  const prev = getPrefsInternal();
  const next = { ...prev, ...(patch || {}) };
  setPrefsInternal(next);
}

export function isProductHistoryPaused() {
  const until = Number(getPrefsInternal().pauseProductUntil || 0);
  return Number.isFinite(until) && until > Date.now();
}

export function getProductHistoryPauseUntil() {
  const until = Number(getPrefsInternal().pauseProductUntil || 0);
  return Number.isFinite(until) ? until : 0;
}

export function pauseProductHistoryFor(ms) {
  const dur = Number(ms) || 0;
  const until = dur > 0 ? Date.now() + dur : 0;
  setHistoryPrefs({ pauseProductUntil: until });
}

export function pauseProductHistoryUntil(ts) {
  const until = Number(ts) || 0;
  setHistoryPrefs({ pauseProductUntil: until });
}

export function resumeProductHistory() {
  setHistoryPrefs({ pauseProductUntil: 0 });
}

export function isSearchHistoryEnabled() {
  const disable = Boolean(getPrefsInternal().disableSearch);
  return !disable;
}

export function setSearchHistoryEnabled(enabled) {
  setHistoryPrefs({ disableSearch: !enabled });
}

function writeHistory(arr) {
  try {
    const trimmed = Array.isArray(arr) ? arr.slice(0, LIMIT) : [];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
    try {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("pcu-history-updated"));
      }
    } catch {}
  } catch {
    /* ignore */
  }
}

function addHistoryItemRaw(item) {
  const now = Date.now();
  const clean = {
    type: item?.type,
    key: String(item?.key || "").trim(),
    category: item?.category ? String(item.category) : undefined,
    timestamp: Number.isFinite(item?.timestamp) ? Number(item.timestamp) : now,
  };
  if (!clean.type || !clean.key) return;

  const prev = getHistory();
  // remove duplicates by (type,key)
  const filtered = prev.filter(
    (x) => !(x.type === clean.type && x.key === clean.key)
  );
  const next = [clean, ...filtered];
  writeHistory(next);
}

export function recordSearch(query) {
  const key = String(query || "").trim();
  if (!key) return;
  if (!isSearchHistoryEnabled()) return;
  addHistoryItemRaw({ type: "search", key });
}

export function recordProduct(id, category) {
  const key = String(id || "").trim();
  if (!key) return;
  const cat = category ? String(category).trim() : undefined;
  if (isProductHistoryPaused()) return;
  addHistoryItemRaw({ type: "product", key, category: cat });
}

export function recordCategory(slugOrName) {
  const key = String(slugOrName || "").trim();
  if (!key) return;
  addHistoryItemRaw({ type: "category", key });
}

export function clearHistory() {
  writeHistory([]);
}

export function clearHistoryByType(type) {
  const prev = getHistory();
  writeHistory(prev.filter((x) => x.type !== type));
}

export function removeHistoryItem(type, key) {
  const prev = getHistory();
  writeHistory(prev.filter((x) => !(x.type === type && x.key === key)));
}
