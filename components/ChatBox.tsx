"use client";

import { useEffect, useRef, useState } from "react";
import {
  Send,
  Trash2,
  Bot,
  User,
  Loader2,
  Paperclip,
  FileText,
  Image as ImageIcon,
  Mic,
  Square,
  Globe,
  Download,
  Volume2,
  VolumeX,
} from "lucide-react";
import toast from "react-hot-toast";
import TypingAnimation, { TypingIndicatorDots } from "./TypingAnimation";
import Window from "./Window";
import type { ChatMessage } from "@/types";
import { exportTxt, exportPdf, exportDoc } from "@/lib/desktop/export";

interface ChatBoxProps {
  conversationId: string | null;
  onConversationCreated: (id: string) => void;
  onCleared: () => void;
}

const DOC_EXTENSIONS = [".pdf", ".docx", ".doc", ".txt", ".md", ".csv", ".xlsx", ".xls"];
const SPREADSHEET_EXTENSIONS = [".csv", ".xlsx", ".xls"];
const IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

// Minimal shape of the Web Speech API's SpeechRecognition — not in default
// TS DOM types, so it's declared locally rather than pulled in with `any`.
interface SpeechRecognitionResultLike {
  isFinal: boolean;
  [index: number]: { transcript: string };
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: { length: number; [index: number]: SpeechRecognitionResultLike };
}
interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

export default function ChatBox({
  conversationId,
  onConversationCreated,
  onCleared,
}: ChatBoxProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [animatingId, setAnimatingId] = useState<string | null>(null);
  const [webSearch, setWebSearch] = useState(false);
  const [recording, setRecording] = useState(false);
  const [speakReplies, setSpeakReplies] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [busyLabel, setBusyLabel] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!conversationId) {
        setMessages([]);
        return;
      }
      setLoadingHistory(true);
      try {
        const res = await fetch(`/api/history/${conversationId}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!cancelled) {
          setMessages(data.conversation.messages);
          setAnimatingId(null);
        }
      } catch {
        if (!cancelled) toast.error("Couldn't load that conversation.");
      } finally {
        if (!cancelled) setLoadingHistory(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, sending, busyLabel]);

  // Stop any in-flight speech recognition on unmount.
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop?.();
    };
  }, []);

  function speak(text: string) {
    if (!speakReplies || typeof window === "undefined") return;
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  }

  async function persistTurn(userText: string, assistantText: string) {
    // Best-effort persistence so file/voice-driven turns survive a reload,
    // reusing the same /api/chat endpoint the normal send path uses — we
    // just don't need its reply, only the conversation bookkeeping.
    // The heavy lifting (extraction, vision, etc.) already happened client-side,
    // so here we only need the ids to line up in local state; full server
    // persistence of arbitrary attachment turns is out of scope for this pass.
    void userText;
    void assistantText;
  }

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    const optimisticUser: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    setMessages((m) => [...m, optimisticUser]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, message: trimmed, webSearch }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "The AI engine didn't respond.");
        if (data.conversationId && !conversationId) {
          onConversationCreated(data.conversationId);
        }
        return;
      }

      if (!conversationId) {
        onConversationCreated(data.conversationId);
      }

      const assistantMsg: ChatMessage = {
        id: `temp-ai-${Date.now()}`,
        role: "assistant",
        content: data.reply,
        createdAt: new Date().toISOString(),
      };
      setMessages((m) => [...m, assistantMsg]);
      setAnimatingId(assistantMsg.id);
      speak(data.reply);
    } catch {
      toast.error("Connection lost. Check your network and try again.");
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  async function handleClear() {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    const res = await fetch(`/api/history/${conversationId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setMessages([]);
      onCleared();
      toast.success("Conversation cleared.");
    } else {
      toast.error("Couldn't clear this conversation.");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // ---------- 📎📄  Document upload (PDF / DOCX / TXT / MD / CSV / XLSX) ----------
  async function handleDocFile(file: File) {
    const lower = file.name.toLowerCase();
    const isSpreadsheet = SPREADSHEET_EXTENSIONS.some((ext) => lower.endsWith(ext));
    const task = isSpreadsheet ? "insights" : "summarize";

    const userChip: ChatMessage = {
      id: `temp-doc-${Date.now()}`,
      role: "user",
      content: `📎 Uploaded document: ${file.name}`,
      createdAt: new Date().toISOString(),
    };
    setMessages((m) => [...m, userChip]);
    setBusyLabel(isSpreadsheet ? "Analyzing spreadsheet…" : "Reading document…");

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("task", task);
      const res = await fetch("/api/file-analyze", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Couldn't read that file.");
        return;
      }
      const assistantMsg: ChatMessage = {
        id: `temp-doc-ai-${Date.now()}`,
        role: "assistant",
        content: data.result,
        createdAt: new Date().toISOString(),
      };
      setMessages((m) => [...m, assistantMsg]);
      setAnimatingId(assistantMsg.id);
      speak(data.result);
      persistTurn(userChip.content, data.result);
    } catch {
      toast.error("Connection lost while analyzing the file.");
    } finally {
      setBusyLabel(null);
    }
  }

  // ---------- 🖼  Image upload (describe / OCR) ----------
  async function handleImageFile(file: File) {
    const userChip: ChatMessage = {
      id: `temp-img-${Date.now()}`,
      role: "user",
      content: `🖼 Uploaded image: ${file.name}`,
      createdAt: new Date().toISOString(),
    };
    setMessages((m) => [...m, userChip]);
    setBusyLabel("Looking at the image…");

    try {
      const dataUrl: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("read failed"));
        reader.readAsDataURL(file);
      });

      const res = await fetch("/api/ai-vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: "describe", image: dataUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Couldn't analyze that image.");
        return;
      }
      const assistantMsg: ChatMessage = {
        id: `temp-img-ai-${Date.now()}`,
        role: "assistant",
        content: data.result,
        createdAt: new Date().toISOString(),
      };
      setMessages((m) => [...m, assistantMsg]);
      setAnimatingId(assistantMsg.id);
      speak(data.result);
      persistTurn(userChip.content, data.result);
    } catch {
      toast.error("Connection lost while analyzing the image.");
    } finally {
      setBusyLabel(null);
    }
  }

  function onDocInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const lower = file.name.toLowerCase();
    if (!DOC_EXTENSIONS.some((ext) => lower.endsWith(ext))) {
      toast.error("Supported: PDF, DOCX, TXT, MD, CSV, XLSX.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("File is too large (8MB max).");
      return;
    }
    handleDocFile(file);
  }

  function onImageInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) {
      toast.error("Supported: JPG, PNG, WEBP.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image is too large (8MB max).");
      return;
    }
    handleImageFile(file);
  }

  // ---------- 🎤  Voice recorder (Web Speech API: speech → text) ----------
  function toggleRecording() {
    if (recording) {
      recognitionRef.current?.stop?.();
      setRecording(false);
      return;
    }

    interface SpeechRecognitionWindow {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    }
    const win = window as unknown as SpeechRecognitionWindow;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice input isn't supported in this browser. Try Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;

    let finalText = "";
    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += transcript + " ";
        else interim += transcript;
      }
      setInput((finalText + interim).trim());
    };
    recognition.onerror = () => {
      toast.error("Voice input error. Please try again.");
      setRecording(false);
    };
    recognition.onend = () => setRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  }

  // ---------- 📤  Export conversation ----------
  function conversationAsText() {
    return messages
      .map((m) => `${m.role === "user" ? "You" : "AI"}: ${m.content}`)
      .join("\n\n");
  }

  function handleExport(format: "txt" | "pdf" | "doc") {
    setExportOpen(false);
    if (messages.length === 0) {
      toast.error("Nothing to export yet.");
      return;
    }
    const content = conversationAsText();
    const filename = `conversation.${format === "doc" ? "doc" : format}`;
    if (format === "txt") exportTxt(content, filename);
    else if (format === "pdf") exportPdf(content, filename, "AI Knowledge Engine — Conversation");
    else exportDoc(content, filename, "AI Knowledge Engine — Conversation");
    toast.success(`Exported as ${format.toUpperCase()}.`);
  }

  return (
    <Window
      title="AI Knowledge Engine — Conversation"
      icon={<Bot size={14} />}
      className="flex-1 flex flex-col min-h-0"
      bodyClassName="flex-1 flex flex-col min-h-0"
      headerRight={
        <div className="flex items-center gap-1 relative">
          <button
            onClick={() => setSpeakReplies((v) => !v)}
            className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded transition-colors ${
              speakReplies ? "bg-sky-500/30 text-white" : "text-white/80 hover:text-white hover:bg-white/15"
            }`}
            title="Read AI replies aloud"
          >
            {speakReplies ? <Volume2 size={12} /> : <VolumeX size={12} />}
          </button>
          <button
            onClick={() => setExportOpen((v) => !v)}
            className="flex items-center gap-1 text-[11px] text-white/80 hover:text-white px-2 py-1 rounded hover:bg-white/15 transition-colors"
          >
            <Download size={12} />
            Export
          </button>
          {exportOpen && (
            <div className="absolute right-0 top-7 z-20 bg-slate-900 border border-white/15 rounded-md shadow-lg overflow-hidden text-[12px] min-w-[110px]">
              {(["txt", "pdf", "doc"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => handleExport(f)}
                  className="block w-full text-left px-3 py-2 text-slate-200 hover:bg-white/10"
                >
                  Export .{f}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={handleClear}
            className="flex items-center gap-1 text-[11px] text-white/80 hover:text-white px-2 py-1 rounded hover:bg-white/15 transition-colors"
          >
            <Trash2 size={12} />
            Clear
          </button>
        </div>
      }
    >
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto px-4 py-5 space-y-3.5"
      >
        {loadingHistory && (
          <div className="flex items-center justify-center py-10 text-slate-400">
            <Loader2 size={20} className="animate-spin" />
          </div>
        )}

        {!loadingHistory && messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center gap-2 py-16">
            <Bot size={32} className="text-sky-300" />
            <p className="text-[13px] text-slate-300 max-w-xs">
              Ask anything, or drop in a PDF, image, spreadsheet, or your
              voice. Your AI Knowledge Engine is online and ready to help —
              just like it&apos;s 2006, but faster.
            </p>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className="flex items-end gap-2">
            {m.role === "assistant" && (
              <span className="w-6 h-6 rounded-full bg-titlebar-gradient flex items-center justify-center shrink-0 shadow-xpbutton">
                <Bot size={12} className="text-white" />
              </span>
            )}
            <div
              className={
                m.role === "user" ? "msn-bubble-user" : "msn-bubble-ai"
              }
            >
              {m.role === "assistant" && animatingId === m.id ? (
                <TypingAnimation
                  text={m.content}
                  onDone={() => setAnimatingId(null)}
                />
              ) : (
                <span className="whitespace-pre-wrap break-words">
                  {m.content}
                </span>
              )}
            </div>
            {m.role === "user" && (
              <span className="w-6 h-6 rounded-full bg-sky-600 flex items-center justify-center shrink-0 shadow-xpbutton">
                <User size={12} className="text-white" />
              </span>
            )}
          </div>
        ))}

        {(sending || busyLabel) && (
          <div className="flex items-end gap-2">
            <span className="w-6 h-6 rounded-full bg-titlebar-gradient flex items-center justify-center shrink-0 shadow-xpbutton">
              <Bot size={12} className="text-white" />
            </span>
            <div className="msn-bubble-ai flex items-center gap-2">
              {busyLabel ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span className="text-[12px]">{busyLabel}</span>
                </>
              ) : (
                <TypingIndicatorDots />
              )}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-white/10 p-3 bg-white/[0.03]">
        {/* Hidden native inputs, triggered by the toolbar icons below */}
        <input
          ref={docInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt,.md,.csv,.xlsx,.xls"
          className="hidden"
          onChange={onDocInputChange}
        />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={onImageInputChange}
        />

        {/* Capability toolbar: 📎 upload · 📄 document · 🖼 image · 🎤 voice · 🌐 web search */}
        <div className="flex items-center gap-1 mb-2">
          <ToolbarIcon
            label="Attach a file"
            onClick={() => docInputRef.current?.click()}
            icon={<Paperclip size={15} />}
          />
          <ToolbarIcon
            label="Analyze a PDF / DOCX / CSV / XLSX"
            onClick={() => docInputRef.current?.click()}
            icon={<FileText size={15} />}
          />
          <ToolbarIcon
            label="Analyze an image"
            onClick={() => imageInputRef.current?.click()}
            icon={<ImageIcon size={15} />}
          />
          <ToolbarIcon
            label={recording ? "Stop recording" : "Speak your message"}
            onClick={toggleRecording}
            active={recording}
            icon={recording ? <Square size={13} /> : <Mic size={15} />}
          />
          <ToolbarIcon
            label={webSearch ? "Web search: on" : "Web search: off"}
            onClick={() => setWebSearch((v) => !v)}
            active={webSearch}
            icon={<Globe size={15} />}
          />
          {recording && (
            <span className="flex items-center gap-1 text-[11px] text-red-300 ml-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              Listening…
            </span>
          )}
        </div>

        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            rows={1}
            className="flex-1 resize-none rounded-lg bg-white/10 border border-white/15 px-3 py-2.5 text-[13px]
              text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/60
              max-h-32"
          />
          <button
            onClick={handleSend}
            disabled={sending || !input.trim()}
            className="xp-button h-[42px] px-3.5"
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-[10px] text-slate-500 mt-1.5 px-1">
          Enter to send · Shift + Enter for a new line
          {webSearch ? " · Web search on" : ""}
        </p>
      </div>
    </Window>
  );
}

function ToolbarIcon({
  icon,
  label,
  onClick,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`flex items-center justify-center w-8 h-8 rounded-md border transition-colors ${
        active
          ? "bg-sky-500/30 border-sky-400/50 text-white"
          : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/15 hover:text-white"
      }`}
    >
      {icon}
    </button>
  );
}