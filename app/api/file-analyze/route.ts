import { NextRequest, NextResponse } from "next/server";
import { runAiTask, type AiTask } from "@/lib/aiTools";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB
type FileTask = AiTask | "qa" | "extract";

async function extractText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const name = file.name.toLowerCase();

  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (
    name.endsWith(".docx") ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  // .txt and anything else plain-text
  return buffer.toString("utf-8");
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const task = String(form.get("task") || "summarize") as FileTask;
    const question = String(form.get("question") || "");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "File is too large (8MB max)." },
        { status: 400 }
      );
    }

    let text: string;
    try {
      text = (await extractText(file)).trim();
    } catch (e) {
      console.error("File extraction error:", e);
      return NextResponse.json(
        { error: "Couldn't read that file. Try a PDF, DOCX, or TXT file." },
        { status: 400 }
      );
    }

    if (!text) {
      return NextResponse.json(
        { error: "No readable text found in that file." },
        { status: 400 }
      );
    }

    const truncated = text.slice(0, 12000);

    let result: string;
    if (task === "qa" && question) {
      const { generateChatReply } = await import("@/lib/groq");
      result = await generateChatReply([
        {
          role: "user",
          content: `Using only the document text below, answer the question. If the answer isn't in the document, say so.\n\nDOCUMENT:\n${truncated}\n\nQUESTION: ${question}`,
        },
      ]);
    } else if (task === "extract") {
      const { generateChatReply } = await import("@/lib/groq");
      result = await generateChatReply([
        {
          role: "user",
          content: `Extract the key points from this document as a short bullet list.\n\n${truncated}`,
        },
      ]);
    } else {
      const safeTask: AiTask = task === "summarize" || task === "explain" ? task : "summarize";
      result = await runAiTask(safeTask, truncated);
    }

    return NextResponse.json({
      result,
      charCount: text.length,
      truncated: text.length > 12000,
    });
  } catch (err) {
    console.error("file-analyze error:", err);
    return NextResponse.json(
      { error: "Something went wrong analyzing that file." },
      { status: 500 }
    );
  }
}