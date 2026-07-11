# AI Knowledge Engine 2006 (ChatGPT 2006)

A Windows XP–styled AI chat app. 2006 visual nostalgia, 2026-quality frontend
engineering underneath.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS + Framer Motion-ready CSS animations
- Prisma ORM + PostgreSQL (e.g. Neon, Supabase, Vercel Postgres)
- Groq API for AI replies
- Next.js API Routes (no separate backend)

There's also a bonus `/desktop` route — a full Windows XP desktop shell with
its own set of AI-powered apps (Notepad, Paint, Internet Explorer, Outlook
Express, File Analyzer, and more). See `README-DESKTOP.md` for details.

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables**

   Copy the example file and fill in your own values:

   ```bash
   cp .env.example .env
   ```

   ```
   GROQ_API_KEY=your_groq_api_key_here
   DATABASE_URL="postgresql://username:password@host/neondb?sslmode=require"
   ```

   - Get a free Groq API key at https://console.groq.com/keys
   - Get a free Postgres database at https://neon.tech, https://supabase.com,
     or via Vercel Postgres.

3. **Set up the database**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

   This creates the `Conversation` and `Message` tables in your Postgres
   database.

4. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open http://localhost:3000.

## Project structure

```
app/
  page.tsx              Landing page (XP welcome window + animated bg)
  chat/page.tsx          Chat interface (sidebar + message thread)
  history/page.tsx       Full conversation history list
  help/page.tsx          Help / About / FAQ
  desktop/page.tsx        Bonus XP desktop shell (see README-DESKTOP.md)
  api/
    chat/route.ts        POST — sends a message, gets a Groq reply, persists both
    history/route.ts     GET (list) / DELETE (clear all)
    history/[id]/route.ts  GET (one conversation) / DELETE (one conversation)
    ai-tools/route.ts     POST — single-shot AI tasks (rewrite, summarize, translate...)
    ai-vision/route.ts    POST — image understanding (describe, OCR, caption...)
    file-analyze/route.ts POST — PDF/DOCX/TXT summarize/explain/extract/Q&A

components/
  Window.tsx             XP-style window chrome (title bar, traffic-light buttons)
  Sidebar.tsx            Conversation list in the chat page
  ChatBox.tsx            Message thread + input + typing animation
  XPButton.tsx           Glossy XP-style button
  TypingAnimation.tsx    Character-by-character reveal + typing dots
  Navbar.tsx             Glass nav bar (Chat / History / Help)
  AnimatedBackground.tsx Aurora mesh + glowing orbs + network-line canvas
  BootScreen.tsx          "Connecting..." dial-up loading screen
  desktop/                XP desktop shell components (see README-DESKTOP.md)

lib/
  prisma.ts              Prisma client singleton
  groq.ts                Groq API wrapper (generateChatReply)
  aiTools.ts              Single-shot AI task prompts (rewrite, grammar, summarize...)
  aiVision.ts             Groq vision model wrapper
  utils.ts                cn(), deriveTitle(), formatTimestamp()
  desktop/                Desktop-shell-only helpers (notes, pins, export, sounds)

prisma/
  schema.prisma           Conversation + Message models
```

## Notes

- If `GROQ_API_KEY` is missing, the chat API returns a friendly in-app
  error instead of crashing, so you can still click through the UI.
- No authentication is wired up (per the MVP brief). Add NextAuth.js if you
  need per-user accounts later.
- Your `.env` file contains real secrets (API keys, database credentials).
  It's already gitignored — never commit it or share it directly.

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import it in Vercel.
3. Add the `GROQ_API_KEY` and `DATABASE_URL` environment variables in the
   Vercel project settings.
4. Deploy.
