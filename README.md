# \# Windows XP AI (ChatGPT 2006)

# 

# A Windows XP–styled AI chat app. 2006 visual nostalgia, 2026-quality frontend

# engineering underneath.

# 

# \## Stack

# 

# \- Next.js 15 (App Router) + React 19 + TypeScript

# \- Tailwind CSS + Framer Motion-ready CSS animations

# \- Prisma ORM + PostgreSQL (e.g. Neon, Supabase, Vercel Postgres)

# \- Groq API for AI replies

# \- Next.js API Routes (no separate backend)

# 

# There's also a bonus `/desktop` route — a full Windows XP desktop shell with

# its own set of AI-powered apps (Notepad, Paint, Internet Explorer, Outlook

# Express, File Analyzer, and more). See `README-DESKTOP.md` for details.

# 

# \## Getting started

# 

# 1\. \*\*Install dependencies\*\*

# 

# &#x20;  ```bash

# &#x20;  npm install

# &#x20;  ```

# 

# 2\. \*\*Set up environment variables\*\*

# 

# &#x20;  Copy the example file and fill in your own values:

# 

# &#x20;  ```bash

# &#x20;  cp .env.example .env

# &#x20;  ```

# 

# &#x20;  ```

# &#x20;  GROQ\_API\_KEY=your\_groq\_api\_key\_here

# &#x20;  DATABASE\_URL="postgresql://username:password@host/neondb?sslmode=require"

# &#x20;  ```

# 

# &#x20;  - Get a free Groq API key at https://console.groq.com/keys

# &#x20;  - Get a free Postgres database at https://neon.tech, https://supabase.com,

# &#x20;    or via Vercel Postgres.

# 

# 3\. \*\*Set up the database\*\*

# 

# &#x20;  ```bash

# &#x20;  npx prisma generate

# &#x20;  npx prisma db push

# &#x20;  ```

# 

# &#x20;  This creates the `Conversation` and `Message` tables in your Postgres

# &#x20;  database.

# 

# 4\. \*\*Run the dev server\*\*

# 

# &#x20;  ```bash

# &#x20;  npm run dev

# &#x20;  ```

# 

# &#x20;  Open http://localhost:3000.

# 

# \## Project structure

# 

# ```

# app/

# &#x20; page.tsx              Landing page (XP welcome window + animated bg)

# &#x20; chat/page.tsx          Chat interface (sidebar + message thread)

# &#x20; history/page.tsx       Full conversation history list

# &#x20; help/page.tsx          Help / About / FAQ

# &#x20; desktop/page.tsx        Bonus XP desktop shell (see README-DESKTOP.md)

# &#x20; api/

# &#x20;   chat/route.ts        POST — sends a message, gets a Groq reply, persists both

# &#x20;   history/route.ts     GET (list) / DELETE (clear all)

# &#x20;   history/\[id]/route.ts  GET (one conversation) / DELETE (one conversation)

# &#x20;   ai-tools/route.ts     POST — single-shot AI tasks (rewrite, summarize, translate...)

# &#x20;   ai-vision/route.ts    POST — image understanding (describe, OCR, caption...)

# &#x20;   file-analyze/route.ts POST — PDF/DOCX/TXT summarize/explain/extract/Q\&A

# 

# components/

# &#x20; Window.tsx             XP-style window chrome (title bar, traffic-light buttons)

# &#x20; Sidebar.tsx            Conversation list in the chat page

# &#x20; ChatBox.tsx            Message thread + input + typing animation

# &#x20; XPButton.tsx           Glossy XP-style button

# &#x20; TypingAnimation.tsx    Character-by-character reveal + typing dots

# &#x20; Navbar.tsx             Glass nav bar (Chat / History / Help)

# &#x20; AnimatedBackground.tsx Aurora mesh + glowing orbs + network-line canvas

# &#x20; BootScreen.tsx          "Connecting..." dial-up loading screen

# &#x20; desktop/                XP desktop shell components (see README-DESKTOP.md)

# 

# lib/

# &#x20; prisma.ts              Prisma client singleton

# &#x20; groq.ts                Groq API wrapper (generateChatReply)

# &#x20; aiTools.ts              Single-shot AI task prompts (rewrite, grammar, summarize...)

# &#x20; aiVision.ts             Groq vision model wrapper

# &#x20; utils.ts                cn(), deriveTitle(), formatTimestamp()

# &#x20; desktop/                Desktop-shell-only helpers (notes, pins, export, sounds)

# 

# prisma/

# &#x20; schema.prisma           Conversation + Message models

# ```

# 

# \## Notes

# 

# \- If `GROQ\_API\_KEY` is missing, the chat API returns a friendly in-app

# &#x20; error instead of crashing, so you can still click through the UI.

# \- No authentication is wired up (per the MVP brief). Add NextAuth.js if you

# &#x20; need per-user accounts later.

# \- Your `.env` file contains real secrets (API keys, database credentials).

# &#x20; It's already gitignored — never commit it or share it directly.

# 

# \## Deploying to Vercel

# 

# 1\. Push this repo to GitHub.

# 2\. Import it in Vercel.

# 3\. Add the `GROQ\_API\_KEY` and `DATABASE\_URL` environment variables in the

# &#x20;  Vercel project settings.

# 4\. Deploy.

