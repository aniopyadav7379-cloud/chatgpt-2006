import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateChatReply } from "@/lib/gemini";
import { deriveTitle } from "@/lib/utils";

const bodySchema = z.object({
  conversationId: z.string().nullable().optional(),
  message: z.string().min(1, "Message cannot be empty").max(4000),
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

    const { message } = parsed.data;
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

    let reply: string;
    try {
      reply = await generateChatReply(
        history.map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        }))
      );
    } catch (err) {
      console.error("Gemini error:", err);
      const fallback =
        err instanceof Error && err.message.includes("GEMINI_API_KEY")
          ? "The AI engine isn't configured yet — add a GEMINI_API_KEY to your .env file to bring it online."
          : "Connection to the AI engine dropped. Please try again in a moment.";
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