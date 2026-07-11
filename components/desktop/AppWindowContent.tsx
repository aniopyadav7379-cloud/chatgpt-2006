"use client";

import type { WindowInstance } from "@/types/desktop";
import MyComputerApp from "./apps/MyComputerApp";
import MyDocumentsApp from "./apps/MyDocumentsApp";
import RecycleBinApp from "./apps/RecycleBinApp";
import HelpApp from "./apps/HelpApp";
import AIAssistantApp from "./apps/AIAssistantApp";
import NotepadApp from "./apps/NotepadApp";
import PaintApp from "./apps/PaintApp";
import InternetExplorerApp from "./apps/InternetExplorerApp";
import OutlookApp from "./apps/OutlookApp";
import FileAnalyzerApp from "./apps/FileAnalyzerApp";
import SearchApp from "./apps/SearchApp";
import HistoryApp from "./apps/HistoryApp";
import ControlPanelApp from "./apps/ControlPanelApp";

export default function AppWindowContent({ win }: { win: WindowInstance }) {
  switch (win.appId) {
    case "my-computer":
      return <MyComputerApp />;
    case "my-documents":
      return <MyDocumentsApp />;
    case "recycle-bin":
      return <RecycleBinApp />;
    case "help":
      return <HelpApp />;
    case "assistant":
      return <AIAssistantApp win={win} />;
    case "notepad":
      return <NotepadApp win={win} />;
    case "paint":
      return <PaintApp />;
    case "ie":
      return <InternetExplorerApp />;
    case "outlook":
      return <OutlookApp />;
    case "file-analyzer":
      return <FileAnalyzerApp />;
    case "search":
      return <SearchApp />;
    case "history":
      return <HistoryApp />;
    case "control-panel":
      return <ControlPanelApp />;
    default:
      return null;
  }
}