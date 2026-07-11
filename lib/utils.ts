import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Turns the first user message of a chat into a short, XP-Explorer-style title. */
export function deriveTitle(message: string): string {
  const trimmed = message.trim().replace(/\s+/g, " ");
  if (trimmed.length <= 42) return trimmed || "New Conversation";
  return trimmed.slice(0, 42).trimEnd() + "…";
}

export function formatTimestamp(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Simulated dial-up connection delay for the retro loading screen. */
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
