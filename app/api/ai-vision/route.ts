import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { analyzeImage, type VisionTask } from "@/lib/aiVision";

const TASKS: VisionTask[] = ["describe", "ocr", "graph", "caption"];

const bodySchema = z.object({
  task: z.enum(TASKS as [VisionTask, ...VisionTask[]]),
  image: z.string().startsWith("data:image/", "Expected a base64 image data URL"),
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

    const { task, image } = parsed.data;
    const result = await analyzeImage(task, image);
    return NextResponse.json({ result });
  } catch (err) {
    console.error("ai-vision error:", err);
    const msg = err instanceof Error ? err.message : "";
    let fallback = "The vision model didn't respond. Please try again.";
    if (msg.includes("GROQ_UNCONFIGURED")) {
      fallback = "Groq API key isn't configured. Set GROQ_API_KEY in .env.local.";
    } else if (msg.includes("GROQ_VISION_ERROR")) {
      fallback = "Groq's vision model rejected the request. It may have been renamed — check GROQ_VISION_MODEL.";
    }
    return NextResponse.json({ error: fallback }, { status: 502 });
  }
}