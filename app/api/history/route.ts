import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ConversationSummary } from "@/types";

export async function GET() {
  const conversations = await prisma.conversation.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        take: 1,
      },
      _count: { select: { messages: true } },
    },
  });

  const summaries: ConversationSummary[] = conversations.map(
    (c: {
      id: string;
      title: string;
      createdAt: Date;
      updatedAt: Date;
      _count: { messages: number };
      messages: { content: string }[];
    }) => ({
      id: c.id,
      title: c.title,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      messageCount: c._count.messages,
      preview: c.messages[0]?.content?.slice(0, 120) ?? "",
    })
  );

  return NextResponse.json({ conversations: summaries });
}

export async function DELETE() {
  await prisma.message.deleteMany({});
  await prisma.conversation.deleteMany({});
  return NextResponse.json({ success: true });
}
