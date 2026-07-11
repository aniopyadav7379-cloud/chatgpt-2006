# AI Knowledge Engine 2006 — Desktop Shell Add-on

This is an **additive** feature drop: every file here is new, except `package.json`
(3 new dependencies added) and `lib/groq.ts` / `app/api/chat/route.ts` (from the
earlier Ollama→Groq change — included again so this zip is self-contained; skip them
if you already applied that change).

Nothing in your existing `/`, `/chat`, `/history`, or `/help` pages was touched.
The whole new experience lives at **`/desktop`**.

## 1. Copy files in

Unzip this on top of your project — every path matches your existing structure
(`app/`, `components/`, `lib/`, `types/`). It only adds files/folders; it does not
overwrite anything except `package.json`.

## 2. Install the 3 new dependencies

```bash
npm install
```

Adds: `mammoth` (DOCX text extraction), `pdf-parse` (PDF text extraction), `jspdf`
(client-side PDF export). Everything else (framer-motion, lucide-react,
react-hot-toast) was already in your project and is reused as-is.

## 3. Run it

```bash
npm run dev
```

Visit **`/desktop`** — you'll get the boot screen, then the full XP desktop.
Your existing `/` and `/chat` pages are unchanged and still work normally.

If you want `/desktop` to be the main entry point, change one line yourself in
`app/page.tsx`: swap `router.push("/chat")` for `router.push("/desktop")` in the
`BootScreen`'s `onDone` — left as your call since it changes existing behavior.

## What you get, mapped to your feature list

| # | Feature | Where |
|---|---|---|
| 1 | XP desktop with icons, double-click, right-click menu, draggable windows | `components/desktop/Desktop*.tsx` |
| 2 | Animated background (particles, mouse parallax, light rays) | `components/desktop/AuroraWallpaper.tsx` |
| 3 | AI Assistant ("Windows Intelligence"), MSN-style, streaming-style typing, memory | `apps/AIAssistantApp.tsx` |
| 4 | Clippy nudge, bottom-right | `components/desktop/Clippy.tsx` |
| 5 | AI Notepad with File/Edit/View/Tools/AI menus (Rewrite/Grammar/Summarize/Translate/Explain) | `apps/NotepadApp.tsx` |
| 6 | AI Paint — draw, upload, Describe/OCR/Explain graph/Caption | `apps/PaintApp.tsx`, `lib/aiVision.ts` |
| 7 | Internet Explorer AI — "Ask AI..." address bar | `apps/InternetExplorerApp.tsx` |
| 8 | AI File Analyzer — PDF/DOCX/TXT summarize/explain/extract/Q&A | `apps/FileAnalyzerApp.tsx`, `app/api/file-analyze` |
| 9 | Outlook Express AI — email/resume/cover letter/reply | `apps/OutlookApp.tsx` |
| 10 | AI Search across chats & notes | `apps/SearchApp.tsx` |
| 11 | Conversation History with Pin/Favorite/Folder | `apps/HistoryApp.tsx`, `lib/desktop/pins.ts` |
| 12 | Export PDF/DOC/TXT | `lib/desktop/export.ts` (used in Notepad, Assistant, Outlook) |
| 13 | Windows XP sounds | **Skipped per your choice** — `lib/desktop/soundManager.ts` is wired and ready; drop `.mp3` files into `public/sounds/` (see filenames in that file) and flip `setSoundEnabled(true)` to turn it on |
| 14 | Save session (continue where you left off) | Auto — open apps persist to `localStorage` and reopen next visit |
| 15 | 5 themes (XP Blue/Olive/Silver, Classic, 98) | `apps/ControlPanelApp.tsx`, `desktop-themes.css` |
| 16 | Control Panel (font size, theme, sound, AI model) | `apps/ControlPanelApp.tsx` |
| 17 | Boot screen | Reuses your existing `BootScreen.tsx` — no changes needed |
| 18 | Shutdown screen | `components/desktop/ShutdownScreen.tsx` (Start → Shut Down) |
| 19 | Draggable/resizable/minimize/maximize windows | `components/desktop/DesktopWindow.tsx` |
| 20 | Prompt templates (Summarize/Explain/Code/Email/Resume/Translate/SQL/Blog) | `components/desktop/PromptTemplateBar.tsx` |
| Bonus | Typing animation, CRT effect, cursor trail, window-open animation, taskbar clock, notification balloons | Toggled in Control Panel / built-in |

## Notes & honest limitations

- **My Computer / My Documents / Recycle Bin** are lightweight — decorative drive
  list, your saved notes, and an (always-empty) bin. They're real windows, just
  not deep file-system simulations.
- **AI Paint's vision tools** call Groq's multimodal model
  (`meta-llama/llama-4-scout-17b-16e-instruct`). Groq renames/retires models
  sometimes — if it 404s, check https://console.groq.com/docs/vision and set
  `GROQ_VISION_MODEL` in `.env.local`.
- **Sounds** are intentionally not included (you chose to skip them). Everything
  else is fully wired, not a stub.
- **Theming** reskins title bars and the taskbar via CSS variables scoped to the
  `/desktop` route only — it can't touch your existing pages even if it tried.