export interface SavedNote {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

const KEY = "xp2006:notes";

export function listNotes(): SavedNote[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavedNote[]) : [];
  } catch {
    return [];
  }
}

export function saveNote(note: Omit<SavedNote, "updatedAt">): SavedNote {
  const notes = listNotes();
  const idx = notes.findIndex((n) => n.id === note.id);
  const full: SavedNote = { ...note, updatedAt: new Date().toISOString() };
  if (idx >= 0) notes[idx] = full;
  else notes.unshift(full);
  localStorage.setItem(KEY, JSON.stringify(notes));
  return full;
}

export function deleteNote(id: string) {
  const notes = listNotes().filter((n) => n.id !== id);
  localStorage.setItem(KEY, JSON.stringify(notes));
}

export function newNoteId() {
  return `note-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}