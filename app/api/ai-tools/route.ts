import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runAiTask, type AiTask } from "@/lib/aiTools";

const TASKS: AiTask[] = [
  "rewrite",
  "grammar",
  "summarize",
  "translate",
  "explain",
  "email",
  "resume",
  "coverletter",
  "reply",
  "search-answer",
];

const bodySchema = z.object({
  task: z.enum(TASKS as [AiTask, ...AiTask[]]),
  input: z.string().min(1, "Input cannot be empty").max(8000),
  extra: z.string().max(200).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request" },
        { status: 400 }
      );
    }

    const { task, input, extra } = parsed.data;
    const result = await runAiTask(task, input, extra);
    return NextResponse.json({ result });
  } catch (err) {
    console.error("ai-tools error:", err);
    const msg = err instanceof Error ? err.message : "";
    let fallback = "The AI engine didn't respond. Please try again.";
    if (msg.includes("GROQ_UNCONFIGURED")) {
      fallback = "Groq API key isn't configured. Set GROQ_API_KEY in .env.local.";
    } else if (msg.includes("GROQ_UNREACHABLE")) {
      fallback = "Can't reach Groq right now. Check your connection and try again.";
    }
    return NextResponse.json({ error: fallback }, { status: 502 });
  }
}