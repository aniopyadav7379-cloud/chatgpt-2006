const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2";

export type ChatTurn = {
  role: "user" | "assistant";
  content: string;
};

const SYSTEM_PROMPT = `You are the AI assistant living inside "ChatGPT 2006" — a nostalgic
Windows XP-styled chat app. Be helpful, clear, and a little warm. Keep answers
well formatted with plain text, short paragraphs, and lists where useful. Avoid
markdown tables.`;

/**
 * Sends the full conversation history to a local Ollama server and returns
 * the assistant's reply. Requires Ollama running locally:
 *   1. Install: https://ollama.com/download
 *   2. Pull a model:  ollama pull llama3.2
 *   3. Ollama serves on http://localhost:11434 automatically once installed
 *      (run `ollama serve` if it isn't already running in the background).
 */
export async function generateChatReply(history: ChatTurn[]): Promise<string> {
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.map((turn) => ({
      role: turn.role === "assistant" ? "assistant" : "user",
      content: turn.content,
    })),
  ];

  let response: Response;
  try {
    response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages,
        stream: false,
      }),
    });
  } catch {
    throw new Error(
      `OLLAMA_UNREACHABLE: Couldn't reach Ollama at ${OLLAMA_BASE_URL}. Make sure Ollama is installed and running (try "ollama serve"), and that "${OLLAMA_MODEL}" is pulled (try "ollama pull ${OLLAMA_MODEL}").`
    );
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    if (response.status === 404) {
      throw new Error(
        `OLLAMA_MODEL_MISSING: Model "${OLLAMA_MODEL}" isn't pulled yet. Run: ollama pull ${OLLAMA_MODEL}`
      );
    }
    throw new Error(`OLLAMA_ERROR: Ollama returned ${response.status}. ${text}`);
  }

  const data = await response.json();
  const content: string | undefined = data?.message?.content;
  if (!content) {
    throw new Error("OLLAMA_EMPTY: Ollama returned an empty response.");
  }
  return content.trim();
}