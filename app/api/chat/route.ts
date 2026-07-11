import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateChatReply, generateChatReplyWithSearch, type ChatTurn } from "@/lib/groq";
import { deriveTitle } from "@/lib/utils";

const bodySchema = z.object({
  conversationId: z.string().nullable().optional(),
  message: z.string().min(1, "Message cannot be empty").max(4000),
  webSearch: z.boolean().optional(),
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

    const { message, webSearch } = parsed.data;
    let { conversationId } = parsed.data;

    // Create a new conversation if one wasn't supplied
    if (!conversationId) {
      const conversation = await prisma.conversation.create({
        data: { title: deriveTitle(message) },
      });
      conversationId = conversation.id;
    }

    // Persist the user's message
    await prisma.message.create({
      data: { conversationId, role: "user", content: message },
    });

    // Build history for the model
    const history = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });

    const turns = history.map(
      (m: { role: string; content: string }): ChatTurn => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })
    );

    let reply: string;
    try {
      reply = webSearch
        ? await generateChatReplyWithSearch(turns)
        : await generateChatReply(turns);
    } catch (err) {
      console.error("Groq error:", err);
      const msg = err instanceof Error ? err.message : "";
      let fallback = "Connection to the AI engine dropped. Please try again in a moment.";
      if (msg.includes("GROQ_UNCONFIGURED")) {
        fallback = "Groq API key isn't configured. Set GROQ_API_KEY in .env.local.";
      } else if (msg.includes("GROQ_UNREACHABLE")) {
        fallback = "Can't reach Groq right now. Check your internet connection and try again.";
      } else if (msg.includes("GROQ_UNAUTHORIZED")) {
        fallback = "Groq rejected the API key. Check GROQ_API_KEY in .env.local.";
      } else if (msg.includes("GROQ_MODEL_MISSING")) {
        fallback = msg.replace("GROQ_MODEL_MISSING: ", "");
      } else if (msg.includes("GROQ_ERROR") || msg.includes("GROQ_EMPTY")) {
        fallback = "Groq responded with an error. Please try again shortly.";
      }
      return NextResponse.json(
        { error: fallback, conversationId },
        { status: 502 }
      );
    }

    await prisma.message.create({
      data: { conversationId, role: "assistant", content: reply },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ conversationId, reply });
  } catch (err) {
    console.error("Chat route error:", err);
    return NextResponse.json(
      { error: "Something went wrong on the server." },
      { status: 500 }
    );
  }
}