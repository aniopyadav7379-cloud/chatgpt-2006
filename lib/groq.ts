const GROQ_BASE_URL = process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1";
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

export type ChatTurn = {
  role: "user" | "assistant";
  content: string;
};

const SYSTEM_PROMPT = `You are the AI assistant living inside "ChatGPT 2006" — a nostalgic
Windows XP-styled chat app. Be helpful, clear, and a little warm. Keep answers
well formatted with plain text, short paragraphs, and lists where useful. Avoid
markdown tables.`;

/**
 * Sends the full conversation history to the Groq API and returns
 * the assistant's reply. Requires a Groq API key:
 *   1. Get a key: https://console.groq.com/keys
 *   2. Set GROQ_API_KEY in your environment (.env.local)
 *   3. Optionally set GROQ_MODEL (defaults to "llama-3.3-70b-versatile")
 */
export async function generateChatReply(history: ChatTurn[]): Promise<string> {
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.map((turn) => ({
      role: turn.role === "assistant" ? "assistant" : "user",
      content: turn.content,
    })),
  ];

  if (!GROQ_API_KEY) {
    throw new Error(
      "GROQ_UNCONFIGURED: GROQ_API_KEY is not set. Add it to your .env.local file."
    );
  }

  let response: Response;
  try {
    response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        stream: false,
      }),
    });
  } catch {
    throw new Error(
      `GROQ_UNREACHABLE: Couldn't reach Groq at ${GROQ_BASE_URL}. Check your internet connection.`
    );
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    if (response.status === 401) {
      throw new Error(
        "GROQ_UNAUTHORIZED: Groq rejected the API key. Check GROQ_API_KEY in .env.local."
      );
    }
    if (response.status === 404) {
      throw new Error(
        `GROQ_MODEL_MISSING: Model "${GROQ_MODEL}" wasn't found on Groq. Check GROQ_MODEL.`
      );
    }
    throw new Error(`GROQ_ERROR: Groq returned ${response.status}. ${text}`);
  }

  const data = await response.json();
  const content: string | undefined = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("GROQ_EMPTY: Groq returned an empty response.");
  }
  return content.trim();
}
