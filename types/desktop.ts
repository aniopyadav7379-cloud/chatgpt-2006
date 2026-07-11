export type AppId =
  | "my-computer"
  | "my-documents"
  | "recycle-bin"
  | "help"
  | "assistant"
  | "notepad"
  | "paint"
  | "ie"
  | "outlook"
  | "file-analyzer"
  | "search"
  | "history"
  | "control-panel";

export interface WindowInstance {
  id: string;
  appId: AppId;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
  prevRect?: { x: number; y: number; w: number; h: number };
  /** Free-form per-window data, e.g. { conversationId } for the assistant/history apps. */
  data?: Record<string, unknown>;
}

export type ThemeId = "xp-blue" | "xp-olive" | "xp-silver" | "classic" | "win98";

export interface AppDefinition {
  id: AppId;
  title: string;
  singleton?: boolean;
  defaultSize: { w: number; h: number };
}