import {
  Monitor,
  FolderClosed,
  Trash2,
  HelpCircle,
  Bot,
  FileText,
  Paintbrush,
  Globe,
  Mail,
  FileSearch2,
  Search,
  History,
  Settings,
} from "lucide-react";
import type { ReactNode } from "react";
import type { AppDefinition, AppId } from "@/types/desktop";

export const APP_ICONS: Record<AppId, ReactNode> = {
  "my-computer": <Monitor size={22} />,
  "my-documents": <FolderClosed size={22} />,
  "recycle-bin": <Trash2 size={22} />,
  help: <HelpCircle size={22} />,
  assistant: <Bot size={22} />,
  notepad: <FileText size={22} />,
  paint: <Paintbrush size={22} />,
  ie: <Globe size={22} />,
  outlook: <Mail size={22} />,
  "file-analyzer": <FileSearch2 size={22} />,
  search: <Search size={22} />,
  history: <History size={22} />,
  "control-panel": <Settings size={22} />,
};

export const APP_REGISTRY: Record<AppId, AppDefinition> = {
  "my-computer": { id: "my-computer", title: "My Computer", singleton: true, defaultSize: { w: 560, h: 420 } },
  "my-documents": { id: "my-documents", title: "My Documents", singleton: true, defaultSize: { w: 560, h: 420 } },
  "recycle-bin": { id: "recycle-bin", title: "Recycle Bin", singleton: true, defaultSize: { w: 480, h: 360 } },
  help: { id: "help", title: "Help and Support", singleton: true, defaultSize: { w: 560, h: 460 } },
  assistant: { id: "assistant", title: "Windows Intelligence", singleton: false, defaultSize: { w: 620, h: 560 } },
  notepad: { id: "notepad", title: "AI Notepad — Untitled", singleton: false, defaultSize: { w: 560, h: 480 } },
  paint: { id: "paint", title: "AI Paint — Untitled", singleton: false, defaultSize: { w: 680, h: 540 } },
  ie: { id: "ie", title: "Internet Explorer AI", singleton: true, defaultSize: { w: 680, h: 520 } },
  outlook: { id: "outlook", title: "Outlook Express AI", singleton: true, defaultSize: { w: 640, h: 520 } },
  "file-analyzer": { id: "file-analyzer", title: "AI File Analyzer", singleton: true, defaultSize: { w: 620, h: 540 } },
  search: { id: "search", title: "Search", singleton: true, defaultSize: { w: 520, h: 460 } },
  history: { id: "history", title: "Conversation History", singleton: true, defaultSize: { w: 560, h: 500 } },
  "control-panel": { id: "control-panel", title: "Control Panel", singleton: true, defaultSize: { w: 520, h: 480 } },
};

export const DESKTOP_ICON_ORDER: AppId[] = [
  "my-computer",
  "my-documents",
  "ie",
  "notepad",
  "paint",
  "outlook",
  "assistant",
  "recycle-bin",
  "help",
];

export const START_MENU_ORDER: AppId[] = [
  "assistant",
  "notepad",
  "paint",
  "ie",
  "outlook",
  "file-analyzer",
  "search",
  "history",
  "control-panel",
  "my-computer",
  "my-documents",
  "recycle-bin",
  "help",
];