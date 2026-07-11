export interface ConversationMeta {
  pinned?: boolean;
  favorite?: boolean;
  folder?: string;
}

const KEY = "xp2006:convo-meta";

function readAll(): Record<string, ConversationMeta> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAll(data: Record<string, ConversationMeta>) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function getMeta(id: string): ConversationMeta {
  return readAll()[id] ?? {};
}

export function getAllMeta(): Record<string, ConversationMeta> {
  return readAll();
}

export function setMeta(id: string, patch: Partial<ConversationMeta>) {
  const all = readAll();
  all[id] = { ...all[id], ...patch };
  writeAll(all);
  return all[id];
}

export function togglePin(id: string) {
  const cur = getMeta(id);
  return setMeta(id, { pinned: !cur.pinned });
}

export function toggleFavorite(id: string) {
  const cur = getMeta(id);
  return setMeta(id, { favorite: !cur.favorite });
}

export function setFolder(id: string, folder: string) {
  return setMeta(id, { folder: folder || undefined });
}