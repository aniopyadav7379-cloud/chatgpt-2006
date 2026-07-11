# AI Knowledge Engine 2006 (ChatGPT 2006)

A Windows XP–styled AI chat app. 2006 visual nostalgia, 2026-quality frontend
engineering underneath.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS + Framer Motion-ready CSS animations
- Prisma ORM + SQLite
- Google Gemini API for AI replies
- Next.js API Routes (no separate backend)

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables**

   Copy the example file and add your Gemini API key (free tier available
   at https://aistudio.google.com/apikey):

   ```bash
   cp .env.example .env
   ```

   ```
   GEMINI_API_KEY=your_key_here
   DATABASE_URL="file:./dev.db"
   ```

3. **Set up the database**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

   This creates `prisma/dev.db`, a local SQLite file, with the
   `Conversation` and `Message` tables.

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
  api/
    chat/route.ts        POST — sends a message, gets a Gemini reply, persists both
    history/route.ts     GET (list) / DELETE (clear all)
    history/[id]/route.ts  GET (one conversation) / DELETE (one conversation)

components/
  Window.tsx             XP-style window chrome (title bar, traffic-light buttons)
  Sidebar.tsx            Conversation list in the chat page
  ChatBox.tsx            Message thread + input + typing animation
  XPButton.tsx           Glossy XP-style button
  TypingAnimation.tsx    Character-by-character reveal + typing dots
  Navbar.tsx             Glass nav bar (Chat / History / Help)
  AnimatedBackground.tsx Aurora mesh + glowing orbs + network-line canvas
  BootScreen.tsx          "Connecting..." dial-up loading screen

lib/
  prisma.ts              Prisma client singleton
  gemini.ts              Gemini API wrapper (generateChatReply)
  utils.ts                cn(), deriveTitle(), formatTimestamp()

prisma/
  schema.prisma           Conversation + Message models
```

## Notes

- If `GEMINI_API_KEY` is missing, the chat API returns a friendly in-app
  error instead of crashing, so you can still click through the UI.
- SQLite is great for local dev and demos. For a real deployment, swap the
  Prisma `datasource` provider to `postgresql` and point `DATABASE_URL` at a
  hosted Postgres instance (e.g. Vercel Postgres, Neon, Supabase) — the
  schema and queries don't need to change.
- No authentication is wired up (per the MVP brief). Add NextAuth.js if you
  need per-user accounts later.

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import it in Vercel.
3. Add the `GEMINI_API_KEY` and `DATABASE_URL` environment variables in the
   Vercel project settings. (Swap SQLite for Postgres for production, since
   Vercel's filesystem is ephemeral.)
4. Deploy.
